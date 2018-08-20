

module.exports = (sequelize, DataTypes) => {
  const ArticleTag = sequelize.define('ArticleTag', {
    articleId: DataTypes.UUID,
    tagId: DataTypes.UUID,
  }, {

    indexes: [
      {
        unique: true,
        fields: ['articleId', 'tagId'],
      },
    ],
  });
  ArticleTag.associate = function () {
  };
  ArticleTag.sync();
  return ArticleTag;
};
