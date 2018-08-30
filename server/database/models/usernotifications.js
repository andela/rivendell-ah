module.exports = (sequelize, DataTypes) => {
  const UserNotifications = sequelize.define('UserNotifications', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    notificationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {});
  UserNotifications.associate = (models) => {
    UserNotifications.belongsTo(models.Notification, {
      as: 'notification',
    });
  };
  return UserNotifications;
};
