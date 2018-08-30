/* eslint-disable prefer-template */
import sequelize from 'sequelize';
import models from '../../database/models';
import emailTemplates from '../services/emailTemplates';
import emailService from '../services/emailService';

const { Op } = sequelize;

const {
  Notification, Follow, UserNotifications,
  User, Article, Comment,
} = models;

// an object of arrays of user(s)
// to receive in-app and email notification(s)
let notifnList = {
  email: { loneRecipient: [], subscribers: [] },
  inApp: { loneRecipient: [], subscribers: [] },
};

// include user in sequelize returned value on query
const includeUser = as => ({
  model: User,
  as,
  attributes: ['id', 'firstName', 'lastName',
    'username', 'image', 'email'],
});

// include article in sequelize returned value on query
const includeArticle = as => ({
  model: Article,
  as,
  attributes: ['id', 'title', 'slug'],
});

// include comment in sequelize returned value on query
const includeComment = as => ({
  model: Comment,
  as,
  attributes: ['body'],
});

// notification attributes to be returned on query
const notifnAttrs = () => (['id', 'entityId', 'type', 'createdAt']);

// include notification in sequelize returned value on query
const includeNotifn = () => ({
  model: Notification,
  as: 'notification',
  attributes: notifnAttrs(),
  include: [
    includeUser('source'),
    includeUser('author'),
    includeArticle('article'),
    includeComment('comment'),
  ],
});

/**
 * Build the message to be displayed as notification message
 * @param {Object} notification an object containing notification details
 * @param {Number} userId user id
 * @returns {String} returns a notification message
 */
const buildNotifnMsg = (notification, userId) => {
  const sourceFirstName = notification.source.firstName;
  const authorFirstName = notification.author.firstName;
  const { id: authorId } = notification.author;
  const { type } = notification;
  let output;
  if (type === 'create article') {
    output = sourceFirstName + ' published a new article: '
    + notification.article.title;
  } else if (type === 'create comment') {
    output = authorId === userId ? sourceFirstName
    + ' commented on your article: ' + notification.article.title
      : sourceFirstName + ' commented on ' + authorFirstName + ' article';
  } else if (type === 'following') {
    output = sourceFirstName + ' is now following you';
  } else if (type === 'likes') {
    output = authorId === userId ? sourceFirstName
    + ' liked your article: ' + notification.article.title
      : sourceFirstName + ' just liked ' + notification.article.title;
  }
  return output;
};

/**
 * Build the route to the notification resource
 * @param {Object} notification an object containing notification details
 * @returns {String} a route to the notification resource
 */
const buildNotifnEndpt = (notification) => {
  const { type } = notification;
  let output;
  if (type === 'create article') {
    output = '/api/articles/' + notification.article.slug
    + '?notificationId=' + notification.id;
  } else if (type === 'create comment') {
    output = '/api/articles/' + notification.article.slug
    + '/comments/' + notification.entityId
    + '?notificationId=' + notification.id;
  } else if (type === 'following') {
    output = '/api/profiles/' + notification.source.username
    + '?notificationId=' + notification.id;
  } else if (type === 'likes') {
    output = '/api/articles/' + notification.article.slug
    + '?notificationId=' + notification.id;
  }
  return output;
};

/**
 * build the notification object to be sent to the recipient(s)
 * @param {Object} notification an object containing notification details
 * @param {String} recipientsType the type of recipients
 * ('loneRecipient', 'subscribers')
 * @returns {Object} notification object
 */
const notifnObj = (notification, recipientsType) => {
  const userId = notifnList.inApp[recipientsType][0];
  return {
    notification,
    message: buildNotifnMsg(notification, userId),
    apiEndpoint: buildNotifnEndpt(notification),
  };
};

/**
 * Send notifications to specified recipients in-app
 * @param {Array} recipients an array of the id(s) of users to
 * receive notification
 * @param {Object} notification an object containing notification details
 * @param {Array} clients an object containing logged in clients, where user
 * id is the key and an array of socket id(s) is the value
 * @returns {Null} null
 */
const notifyInApp = (recipients, notification, clients) => {
  recipients.forEach((userId) => {
    const id = userId.toLowerCase();
    if (clients[id]) {
      // loop through the socket ids and emit the notification to
      // the clients corresponding to those socket ids
      clients[id].forEach((client) => {
        global.io.sockets.connected[client].emit('notification', notification);
      });
    }
  });
};

/**
 * Send notifications to specified recipients via email
 * @param {Array} loneRecipient an array containing a single id of a
 * user to receive notification
 * @param {Object} notification an object containing notification details
 * @param {Array} recipients an array of the id(s) of users to
 * receive notification
 * @returns {Null} null
 */
const notifyEmail = (loneRecipient, notification, recipients) => {
  const emailTemplate = emailTemplates
    .notificationTemplate(notification);
  const mailOptions = emailService
    .mailOptions(loneRecipient, 'notification', emailTemplate, recipients);
  emailService.sendMail(mailOptions);
};

/**
 * Controller for in-app notification
 * @param {Array} recipients an array of the id(s) of users to
 * receive notification
 * @param {Object} notification an object containing notification details
 * @returns {Null} null
 */
const inAppNotifn = (recipients, notification) => {
  const { clients } = global;
  if (clients && Object.keys(clients).length > 0) {
    if (recipients.loneRecipient.length > 0) {
      const { loneRecipient } = recipients;
      notifyInApp(loneRecipient, notification.loneRecipient, clients);
    }
    if (recipients.subscribers.length > 0) {
      const { subscribers } = recipients;
      notifyInApp(subscribers, notification.subscribers, clients);
    }
  }
};

/**
 * Controller for email notification
 * @param {Array} recipients an array of the id(s) of users to
 * receive notification
 * @param {Object} notification an object containing notification details
 * @returns {Null} null
 */
const emailNotifn = (recipients, notification) => {
  if (recipients.loneRecipient.length > 0) {
    const userEmail = recipients.loneRecipient[0];
    notifyEmail(userEmail, notification.loneRecipient, []);
  }
  if (recipients.subscribers.length > 0) {
    const { subscribers: subscribersEmails } = recipients;
    notifyEmail([], notification.subscribers, subscribersEmails);
  }
};

/**
 * Bulk create a relationship between a user and his/her notification
 * @param {Array} usersNotifications an array of objects containing
 * a user id and his/her notification id
 * @returns {Null} null
 */
const createUsersNotifns = (usersNotifications) => {
  if (usersNotifications.length < 1) return;
  UserNotifications.bulkCreate(usersNotifications)
    .then((usersNotificationsArr) => {
      // get the notification id from the first user id - notification id
      // objects returned
      const { notificationId } = usersNotificationsArr[0].dataValues;
      return Notification.findOne({
        where: { id: notificationId },
        attributes: notifnAttrs(),
        include: [includeUser('source'), includeUser('author'),
          includeArticle('article'), includeComment('comment')],
      });
    }).then((notification) => {
      const notificationObject = {};
      if (notifnList.inApp.loneRecipient.length > 0) {
        notificationObject
          .loneRecipient = notifnObj(notification, 'loneRecipient');
      }
      if (notifnList.inApp.subscribers.length > 0) {
        notificationObject
          .subscribers = notifnObj(notification, 'subscribers');
      }
      // send out in-app and email notifications
      inAppNotifn(notifnList.inApp, notificationObject);
      emailNotifn(notifnList.email, notificationObject);
      // empty the notification list
      notifnList = {
        email: { loneRecipient: [], subscribers: [] },
        inApp: { loneRecipient: [], subscribers: [] },
      };
    });
};

/**
 * Add the subscriber to the list of users to receive notification
 * @param {Object} subscriber a subscribed follower of a user
 * @param {String} notifnType the type of notification to be
 * sent ('create article', 'create comment', 'like' and 'follow')
 * @returns {Null} null
 */
const addUserToNotifnList = (subscriber, notifnType) => {
  if (subscriber.email && notifnType === 'create article') {
    notifnList.email.subscribers.push(subscriber.follower.email);
  }
  if (subscriber.inApp) {
    notifnList.inApp.subscribers.push(subscriber.follower.id);
  }
};

/**
 * Return an object containing a user id and a notification id,
 * indicating the ownership of the notification by the user
 * @param {Object} subscriber a subscribed follower of a user
 * @param {Number} sourceId the id of the initiator or trigger of the
 * notification, which is mostly a user
 * @param {String} notifnType the type of notification to be
 * sent ('create article', 'create comment', 'like' and 'follow')
 * @param {Number} notificationId notification id
 * @returns {Object} notification object
 */
const userNotifnObj = (subscriber, sourceId, notifnType, notificationId) => {
  if (subscriber.follower.id === sourceId) return null;
  // add the user to the notification list, for in-app and email notification
  addUserToNotifnList(subscriber, notifnType);
  return {
    notificationId,
    userId: subscriber.followerId,
  };
};

/**
 * Add the user to the notification list
 * @param {Number} id user id
 * @returns {Null} null
 */
const appendLoneRecipientToNotifnList = (id) => {
  User.findOne({
    where: { id },
    attributes: ['email'],
  }).then((user) => {
    notifnList.email.loneRecipient.push(user.email);
    notifnList.inApp.loneRecipient.push(id);
  });
};

/**
 * Build the notification list and call the createUsersNotifns
 * to create the owner-notification relationships
 * @param {Number} followingId the id of the person being followed
 * @param {Number} notificationId notification id
 * @param {String} notifnType the type of notification to be
 * sent ('create article', 'create comment', 'like' and 'follow')
 * @param {Number} sourceId the id of the initiator or trigger of the
 * notification, which is mostly a user
 * @returns {Null} null
 */
const buildNotifnList = (followingId, notificationId, notifnType, sourceId) => {
  if (notifnType === 'following') {
    appendLoneRecipientToNotifnList(followingId);
    createUsersNotifns([{ notificationId, userId: followingId }]);
    return;
  }
  Follow.findAll({
    where: {
      followingId,
      [Op.or]: [{ email: true }, { inApp: true }],
    },
    include: [includeUser('follower')],
  }).then((subscribers) => {
    const usersNotifications = subscribers
      .map(subscriber => (
        userNotifnObj(subscriber, sourceId, notifnType, notificationId)
      ));
    if (usersNotifications.indexOf(null) > -1) {
      usersNotifications.splice(usersNotifications.indexOf(null));
    }
    if (notifnType !== 'create article') {
      appendLoneRecipientToNotifnList(followingId);
      usersNotifications.push({ notificationId, userId: followingId });
    }
    createUsersNotifns(usersNotifications);
  });
};

export default {
  includeNotifn,
  buildNotifnEndpt,
  buildNotifnList,
  buildNotifnMsg,
};
