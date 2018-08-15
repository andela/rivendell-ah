export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    body: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {});
  Comment.associate = (models) => {
    Comment.belongsTo(models.Article, {
      as: 'article',
      foreignKey: 'articleId',
    });
    Comment.belongsTo(models.User, {
      as: 'author',
      foreignKey: 'authorId',
    });
  };
  return Comment;
};
