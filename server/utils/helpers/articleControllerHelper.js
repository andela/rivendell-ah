import { Tag } from '../../database/models'; //eslint-disable-line

/**
 * Abstracts the article controller's response
 * @param {Object} article the article object gotten from the database
 * @param {String} username author's username
 * @param {Text} bio author's bio
 * @param {String} image author's image
 * @param {String} slug article's slug
 * @returns {Object} response object
 */


const createArticleResponse = (
  article, subcategoryId, subcategoryName,
  username, bio, image,
) => ({
  id: article.id,
  title: article.title,
  description: article.description,
  body: article.body,
  slug: article.slug,
  image: article.image,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  author: {
    username,
    bio,
    image,
  },
  subcategory: {
    id: subcategoryId,
    name: subcategoryName,
  },
});

/**
 * Abstract the included fields on getting article(s)
 * @param {Object} model sequelize model
 * @param {Object} where selection criteria
 * @returns {Array} an array of sequelize
 * association include options
 */
const includeAuthor = (model, where) => ({
  model,
  as: 'author',
  attributes: ['username', 'bio', 'image'],
  where,
});

const includeSubcategory = (model, where) => ({
  model,
  as: 'subcategory',
  attributes: ['id', 'name'],
  where,
});

const includeSubcategories = (model, where) => ({
  model,
  as: 'subcategories',
  attributes: ['id', 'name'],
  where,
});

const includeArticleLike = (model, where) => ({
  model,
  as: 'likes',
  attributes: ['userId'],
  where,
});


const includeTag = (model, where) => ({
  model,
  attributes: ['name'],
  as: 'tags',
  through: {
    attributes: [],
  },
  where,
});


/**
 * Abstract the attributes requested on getting article(s)
 * @returns {Array} array of sequelize attributes
 */
const articleAttributes = (addAuthorId) => {
  const atributes = [
    'slug', 'title', 'description', 'image',
    'body', 'createdAt', 'updatedAt',
  ];

  if (addAuthorId) atributes.push('authorId');
  return atributes;
};

/**
 * This function accepts an array of tags that the user wants
 * to associate with an article, extracts the ones that have not
 * yet been created and created them. The function then returns
 * an object that contains the created and the found Tags
 * @param {Array} tags an array that contains the tag names
 * @returns {object} an object with attributes createdTags(a promise) and
 * foundTags(sequelize instance) which contains informations
 * about the found and created tags respectively
 */
function createAndFindTags(tags) {
  return Tag.findAll({ where: { name: tags } })
    .then((foundTags) => {
      const tagsNotYetInDB = tags
        .filter(tagInputFromUser => foundTags.findIndex(
          currentTag => currentTag.dataValues.name.toLowerCase()
            === tagInputFromUser.toLowerCase(),
        ) < 0)
        .map(tagName => ({ name: tagName }));

      return Promise.all([
        Tag.bulkCreate(tagsNotYetInDB, { returning: true }),
        foundTags,
      ]);
    }).then(([created, found]) => [...created, ...found]);
}

/**
 * This function takes an array of tags that have the format
 * [{name: 'tagName1'}, {name: 'tagName2'},...]. It then
 *  returns a flat version of the array [ 'tagName1','tagName2',...]
 * @param {Array} tagArr
 * @returns {Array} a flat version of the array passed as argument
 */
const formatTagResponse = tagArr => tagArr.map(elem => elem.name);
export default {
  createArticleResponse,
  createAndFindTags,
  formatTagResponse,
  includeAuthor,
  includeSubcategory,
  includeSubcategories,
  articleAttributes,
  includeTag,
  includeArticleLike,
};
