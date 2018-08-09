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

export default userProfile;
