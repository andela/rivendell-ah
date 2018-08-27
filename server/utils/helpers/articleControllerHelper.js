/**
 * Abstracts the article controller's response
 * @param {Object} article the article object gotten from the database
 * @param {String} username author's username
 * @param {Text} bio author's bio
 * @param {String} image author's image
 * @param {String} slug article's slug
 * @returns {Object} response object
 */
const createArticleResponse = (article, username, bio, image, slug) => ({
  id: article.id,
  title: article.title,
  description: article.description,
  body: article.body,
  slug,
  image: article.image,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  author: {
    username,
    bio,
    image,
  },
});

/**
 * Abstract the included fields on getting article(s)
 * @param {Object} model sequelize model
 * @param {Object} where selection criteria
 * @returns {Array} an array of sequelize
 * association include options
 */
const includeAuthor = (model, where) => [{
  model,
  as: 'author',
  attributes: ['username', 'bio', 'image'],
  where,
}];

/**
 * Abstract the attributes requested on getting article(s)
 * @returns {Array} array of sequelize attributes
 */
const articleAttributes = () => [
  'slug', 'title', 'description', 'image',
  'body', 'createdAt', 'updatedAt',
];

export default {
  createArticleResponse,
  includeAuthor,
  articleAttributes,
};
