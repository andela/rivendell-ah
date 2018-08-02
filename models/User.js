import crypto from 'crypto';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      required: true,
      validate: {
        is: /^[a-zA-Z0-9]+$/i,
      },
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
      beforeCreate: (user) => {
        user.salt = crypto.randomBytes(16).toString('hex');
        user.hash = crypto // eslint-disable-next-line no-param-reassign
          .pbkdf2Sync(user.hash, user.salt, 10000, 512, 'sha512')
          .toString('hex');
      },
    },
  });
  User.associate = (models) => {

  };

  return User;
};
