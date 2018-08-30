import models from '../../database/models';
import tokenService from './tokenService';
import notificationServiceHelper from '../helpers/notificationServiceHelper';

const {
  includeNotifn,
  buildNotifnEndpt,
  buildNotifnList,
  buildNotifnMsg,
} = notificationServiceHelper;

const { Notification, UserNotifications } = models;

/**
 * Notifies the users associated to a notification
 * when it is generated
 * @param {Number} entityId the notification resource id
 * @param {String} type the type of notification to be
 * sent ('create article', 'create comment', 'like' and 'follow')
 * @param {Number} sourceId the id of the initiator or trigger of the
 * notification, which is mostly a user
 * @param {Number} authorId author id, can be null
 * @param {Number} articleId article id, can be null
 * @param {Number} commentId comment id, can be null
 * @returns {Null} null
 */
const notify = (entityId, type, sourceId, authorId, articleId, commentId) => (
  Notification.create({
    entityId, type, sourceId, authorId, articleId, commentId,
  }).then((notification) => {
    buildNotifnList(authorId, notification.id, type, sourceId);
  })
);

/**
 * Get the notifications of a logged in user
 * @param {Object} request the request object contains
 * ( user id, limit and page)
 * @returns {Array} array of notifications
 */
const getUserNotifications = (request) => {
  let { limit } = request;
  const { page, userId } = request;
  limit = limit < 20 && limit > 0 ? limit : 20;
  const offset = page > 0 ? ((page - 1) * limit) : 0;
  return UserNotifications.findAll({
    where: { userId },
    attributes: ['notificationId', 'userId', 'read'],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    include: [includeNotifn()],
  }).then((unreadNotification) => {
    const notifications = unreadNotification.map(data => ({
      data,
      message: buildNotifnMsg(data.notification, data.userId),
      apiEndpoint: buildNotifnEndpt(data.notification),
    }));
    return notifications;
  });
};

/**
 * Set read to true for the associated notification when called
 * @param {Object} req request object from an endpoint
 * @param {Function} next function call to the next controller
 * @returns {Null} null
 */
const readNotification = (req, next) => {
  const { notificationId } = req.query;
  const token = req.headers.authorization;
  if (notificationId && token) {
    const decoded = tokenService.verifyToken(token);
    if (decoded) {
      UserNotifications.update(
        { read: true },
        {
          where: { notificationId, userId: decoded.id },
        },
      ).catch(next);
    }
  }
};

export default {
  notify,
  getUserNotifications,
  readNotification,
};
