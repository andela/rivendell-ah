module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('Follow', {
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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
