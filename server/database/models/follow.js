module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('Follow', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    inApp: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {});
  Follow.associate = (models) => {
    Follow.belongsTo(models.User, {
      as: 'followed', foreignKey: 'followingId',
    });
    Follow.belongsTo(models.User, {
      as: 'follower', foreignKey: 'followerId',
    });
  };
  return Follow;
};
