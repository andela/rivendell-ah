import models from '../database/models';
import errorHelper from '../utils/helpers/errorHelper';

const { Follow } = models;
/**
 *
 * The SubscriptionController contains static methods that are used as
 * controllers to handle the different Subscription routes.
 *  @class SubscriptionController
 *  @returns {undefined} this class does not return anything
 */
class SubscriptionController {
  /**
   * add a user to the follower list of an user
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static subscribe(req, res, next) {
    const { id: followingId } = req.params;
    const { id: followerId } = req.body.decoded;
    const { subscriptionType } = req.body;
    return Follow.findOne({
      where: {
        followingId, followerId,
      },
    }).then((subscriber) => {
      if (!subscriber) {
        errorHelper.throwError('you are not a follower', 403);
      }
      if (subscriber[subscriptionType]) {
        errorHelper.throwError('you\'re already a subscriber', 409);
      }
      return subscriber.updateAttributes({ [subscriptionType]: true })
        .then(() => res.status(201).send());
    }).catch(next);
  }

  /**
   * remove a user from the follower list of an user
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static unsubscribe(req, res, next) {
    const { id: followingId } = req.params;
    const { id: followerId } = req.body.decoded;
    const { subscriptionType } = req.body;
    return Follow.findOne({
      where: {
        followingId, followerId,
      },
    }).then((subscriber) => {
      if (!subscriber) {
        errorHelper.throwError('you are not a follower', 403);
      }
      if (!subscriber[subscriptionType]) {
        errorHelper.throwError('you\'re not a subscriber', 409);
      }
      return subscriber.updateAttributes({ [subscriptionType]: false })
        .then(() => res.status(200).send());
    }).catch(next);
  }
}

export default SubscriptionController;
