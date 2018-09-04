export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.UUID,
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
