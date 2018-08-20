import models from '../database/models';
import userProfile from '../utils/helpers/profileHelper';

const { User, Follow } = models;

/**
 *
 * The FollowController contains static methods that are used as
 * controllers to handle the different Follow routes.
 *  @class FollowController
 *  @returns {undefined} this is a class thus does not return anything
 */
class FollowController {
  /**
   * add a user to the follower list of an user
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static follow(req, res, next) {
    const { id: followerId } = req.body.decoded;
    const followingId = parseInt(req.params.userId, 10);

    // Ensure a user cannot unfollow him/her self
    if (followingId === followerId) {
      return res.status(422).json({
        errors: { message: 'You cannot follow yourself' },
      });
    }
    // Get the user being followed
    User.findById(followingId)
      .then((user) => {
        // Return error message if user is not found
        if (!user) {
          return res.status(404).json({
            errors: { message: 'User not found' },
          });
        }
        Follow.findOrCreate({ where: { followerId, followingId } })
          .spread((userFollower, created) => {
            // No action is performed if you already following an user
            if (!created) {
              return res.status(422).json({
                errors: { message: 'You are already following this User' },
              });
            }
            // Return user's profile
            return res.status(201).json({
              profile: userProfile(user, true),
            });
          });
      }).catch(next);
    return null;
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
        // Return error message if user is not found
        if (!user) {
          return res.status(404).json({
            errors: { message: 'User not found' },
          });
        }
        // Remove user-follower relationship
        user.removeFollower(followerId)
          .then((follow) => {
            if (!follow) {
              return res.status(404).json({
                errors: {
                  message: 'You are not following this author',
                },
              });
            }
            // Return user's profile
            return res.status(200).json({
              profile: userProfile(user, false),
            });
          });
      }).catch(next);
    return null;
  }

  /**
   * returns all the followers of a login user
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
      attributes: ['id', 'username'],
      include: [{
        model: User,
        as: 'followers',
        through: {
          attributes: [],
        },
        attributes: [
          'firstName', 'lastName', 'username',
          'bio', 'image',
        ],
      }],
    })
      .then((followers) => {
        const followersProfile = followers.rows[0].followers;
        if (!followersProfile.length) {
          // return error message if user has no follower
          const errorMessage = otherUser
            ? 'This user does not have any follower'
            : 'You don\'t have any follower';
          return res.status(404).json({
            errors: { message: errorMessage },
          });
        }
        return res.status(200).json({
          followers: followersProfile,
          totalFollowers: followers.count,
        });
      })
      .catch((err) => {
        // Return custom error message if user does not exist
        if (err.message === 'Cannot read property'
        + ' \'followers\' of undefined') {
          return res.status(404).json({
            errors: { message: 'User not found' },
          });
        }
        return next(err);
      });
  }

  /**
   * return all those a login user or the
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
      attributes: ['id', 'username'],
      include: [{
        model: User,
        as: 'followings',
        through: {
          attributes: [],
        },
        attributes: [
          'firstName', 'lastName', 'username',
          'bio', 'image',
        ],
      }],
    })
      .then((followings) => {
        const followingsProfile = followings.rows[0].followings;
        if (!followingsProfile.length) {
          // return error message if user has no follower
          const errorMessage = otherUser
            ? 'This user is not following anyone'
            : 'You are not following anyone';
          return res.status(404).json({
            errors: { message: errorMessage },
          });
        }
        return res.status(200).json({
          followings: followingsProfile,
          totalFollowings: followings.count,
        });
      })
      .catch((err) => {
        // Return custom error message if user does not exist
        if (err.message === 'Cannot read property'
        + ' \'followings\' of undefined') {
          return res.status(404).json({
            errors: { message: 'User not found' },
          });
        }
        return next(err);
      });
  }
}

export default FollowController;
