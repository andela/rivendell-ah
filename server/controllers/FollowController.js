import models from '../database/models';
import errorHelper from '../utils/helpers/errorHelper';
import followControllerHelper from '../utils/helpers/followControllerHelper';
import notificationService from '../utils/services/notificationService';

const { User, Follow } = models;

const { notify } = notificationService;

/**
 *
 * The FollowController contains static methods that are used as
 * controllers to handle the different Follow routes.
 *  @class FollowController
 *  @returns {undefined} this is a class thus does not return anything
 */
class FollowController {
  /**
   * add a user to the follower list of another user
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static follow(req, res, next) {
    const { id: followerId } = req.body.decoded;
    const followingId = req.params.userId;
    // Ensure a user cannot follow him/her self
    if (followingId === followerId) {
      errorHelper.throwError('You cannot follow yourself', 422);
    }
    // Get the user being followed
    User.findById(followingId)
      .then((user) => {
        if (!user) {
          errorHelper.throwError('User not found', 404);
        }
        return Follow.findOrCreate({ where: { followerId, followingId } })
          .spread((userFollower, created) => {
            if (!created) {
              errorHelper
                .throwError('You are already following this User', 422);
            }
            // initialize notification params
            const type = 'following';
            const entityId = userFollower.id;
            // notify users of interest
            notify(entityId, type, followerId, followingId, null, null);
            // Return user's profile
            return res.status(201).json({
              profile: followControllerHelper.userProfile(user, true),
            });
          });
      }).catch(next);
  }

  /**
   * remove a user from the follower list of an user
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static unfollow(req, res, next) {
    const { userId: followingId } = req.params;
    const { id: followerId } = req.body.decoded;
    // Get the user being followed
    User.findById(followingId)
      .then((user) => {
        if (!user) {
          errorHelper.throwError('User not found', 404);
        }
        // Remove user-follower relationship
        return user.removeFollower(followerId)
          .then((follow) => {
            if (!follow) {
              errorHelper.throwError('You are not following this author', 404);
            }
            // Return user's profile
            return res.status(200).json({
              profile: followControllerHelper.userProfile(user, false),
            });
          });
      }).catch(next);
  }

  /**
   * returns all the followers of a logged in user
   * or the specified user
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getFollowers(req, res, next) {
    const otherUser = req.params.userId;
    const userId = otherUser || req.body.decoded.id;
    User.findAndCountAll({
      where: { id: userId },
      attributes: followControllerHelper
        .userAttributes(),
      include: followControllerHelper
        .includeUser(User, 'followers'),
    }).then((followers) => {
      if (!followers.rows[0]) {
        errorHelper.throwError('User not found', 404);
      }
      const followersProfile = followers.rows[0].followers;
      // set totalFollowers to zero(0) if user has no followers
      const totalFollowers = followersProfile.length
        ? followers.count : 0;
      return res.status(200).json({
        followers: followersProfile,
        totalFollowers,
      });
    }).catch(next);
  }

  /**
   * return all those a logged in user or the
   * the specified user is following
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getFollowings(req, res, next) {
    const otherUser = req.params.userId;
    const userId = otherUser || req.body.decoded.id;
    User.findAndCountAll({
      where: { id: userId },
      attributes: followControllerHelper
        .userAttributes(),
      include: followControllerHelper
        .includeUser(User, 'followings'),
    }).then((followings) => {
      if (!followings.rows[0]) {
        errorHelper.throwError('User not found', 404);
      }
      const followingsProfile = followings.rows[0].followings;
      // set totalFollowings to zero(0) if user is not following anyone
      const totalFollowings = followingsProfile.length
        ? followings.count : 0;
      return res.status(200).json({
        followings: followingsProfile,
        totalFollowings,
      });
    }).catch(next);
  }
}

export default FollowController;
