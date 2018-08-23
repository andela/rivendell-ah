/**
 * Format and return the retrieved comments from the DB
 * @param {Array} rawComments array of unformatted comments
 * @returns {Array} an array of comments
 */
const parseComments = (rawComments) => {
  if (rawComments[0] && rawComments[0].id === null) return [];
  return rawComments.map(elem => ({
    id: elem.id,
    body: elem.body,
    type: elem.type,
    parentId: elem.parentId,
    articleId: elem.articleId,
    updatedAt: elem.updatedAt,
    createdAt: elem.createdAt,
    deleted: elem.deleted,
    author: {
      username: elem.username,
      image: elem.image,
    },
    repliesCount: elem.repliesCount,
  }));
};

export default {
  parseComments,
};
