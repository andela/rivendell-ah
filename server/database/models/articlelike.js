

module.exports = (sequelize, DataTypes) => {
  const ArticleLike = sequelize.define('ArticleLike', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    articleId: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['articleId', 'userId'],
      },
    ],
  });
  ArticleLike.associate = (models) => {
    ArticleLike.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    ArticleLike.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article',
    });
    ArticleLike.sync();
  };
  return ArticleLike;
};
