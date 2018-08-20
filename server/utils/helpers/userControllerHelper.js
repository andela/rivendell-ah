/**
 * Abstraction of returned user details
 * @param {Object} user user object gotten from database
 * @param {String} token authentication token
 * @returns {Object} parsed user object
 */
const userDetails = (user, token) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.username,
  image: user.image,
  bio: user.bio,
  verified: user.verified,
  token,
});

export default {
  userDetails,
};
