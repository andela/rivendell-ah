module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    entityId: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.ENUM(
        'create article', 'create comment', 'likes', 'following',
      ),
    },
    sourceId: {
      type: DataTypes.UUID,
    },
    authorId: {
      type: DataTypes.UUID,
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {});
  Notification.associate = (models) => {
    Notification.hasMany(models.UserNotifications, {
      as: 'UserNotifications',
      foreignKey: 'notificationId',
      onDelete: 'cascade',
    });
    Notification.belongsTo(models.User, {
      as: 'source',
      foreignkey: 'sourceId',
    });
    Notification.belongsTo(models.User, {
      as: 'author',
      foreignkey: 'authorId',
    });
    Notification.belongsTo(models.Article, {
      as: 'article',
      foreignkey: 'articleId',
    });
    Notification.belongsTo(models.Comment, {
      as: 'comment',
      foreignkey: 'commentId',
    });
  };
  return Notification;
};
