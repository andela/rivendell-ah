
/* eslint no-param-reassign: off */
import crypto from 'crypto';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      required: true,
      validate: {
        isEmail: true,
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    hooks: {
      /* eslint-disable no-param-reassign */
      beforeCreate: (user) => {
        user.salt = crypto.randomBytes(16).toString('hex');
        user.hash = crypto
          .pbkdf2Sync(user.hash, user.salt, 10000, 512, 'sha512')
          .toString('hex');
      },
    },
  });
  User.associate = () => {};

  return User;
};
