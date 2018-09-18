import errorHelper from './errorHelper';

/**
 * Check if article exists, and check that the one rating
 * is not the author
 * @param {Object} article article object retrieved from the database
 * @param {Number} userId user ID from the token
 * @returns {Boolean} return true on success or throw an error
 */
const validateRating = (article, userId) => {
  if (!article) {
    return errorHelper.throwError('Article not found', 404);
  }
  if (article.authorId === userId) {
    return errorHelper
      .throwError('You can\'t provide ratings for your article', 403);
  }
  return true;
};

/**
 * Abstract the attributes requested on the rating controller
 * @param {Object} sequelize sequelize instance
 * @returns {Array} array of sequelize attributes
 */
const ratingAttributes = sequelize => [
  [sequelize.fn('SUM', sequelize.col('rating')),
    'totalRating'],
  [sequelize.fn('COUNT', sequelize.col('rating')),
    'ratingCount'],
  [sequelize.fn('AVG', sequelize.col('rating')),
    'averageRating'],
];

/**
 * Abstract the attributes requested on the rating controller
 * @param {Object} model model instance
 * @returns {object} user model attributes
 */
const includeRaters = model => ({
  model,
  as: 'user',
  attributes: [
    'firstName', 'lastName', 'email', 'username', 'image',
  ],
});


export default {
  validateRating,
  ratingAttributes,
  includeRaters,
};
