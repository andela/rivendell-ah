/**
 * Abstract the included fields on getting followers/followings
 * @param {Object} model sequelize model
 * @param {String} as display name of model
 * @returns {Array} an array of sequelize
 * association include options
 */
const includeUser = (model, as) => [{
  model,
  as,
  through: {
    attributes: [],
  },
  attributes: [
    'firstName', 'lastName', 'username',
    'bio', 'image',
  ],
}];

/**
 * Abstract the attributes requested on getting followers/followings
 * @returns {Array} array of sequelize attributes
 */
const userAttributes = () => ['id', 'username'];

/**
   * view all those a user is following
   * @param {Object} follows the followers/followings of a user
   * @returns {Array} a list of followers/followings profiles
   */

const userProfile = (user, isFollowing) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  bio: user.bio,
  image: user.image,
  following: isFollowing,
});

export default {
  includeUser,
  userAttributes,
  userProfile,
};
