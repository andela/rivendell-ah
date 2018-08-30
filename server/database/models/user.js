
/* eslint no-param-reassign: off */
import crypto from 'crypto';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
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

  User.associate = (models) => {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'userArticles',
    });
    User.hasMany(models.Rating, {
      foreignKey: 'userId',
      as: 'ratings',
    });
    User.hasMany(models.ArticleLike, {
      foreignKey: 'userId',
      as: 'likes',
    });

    User.belongsToMany(User, {
      as: 'followings',
      through: models.Follow,
      foreignKey: 'followerId',
      onDelete: 'cascade',
    });

    User.belongsToMany(User, {
      as: 'followers',
      through: models.Follow,
      foreignKey: 'followingId',
      onDelete: 'cascade',
    });
    User.hasMany(models.Comment, {
      foreignKey: 'authorId',
      as: 'userComments',
    });
    User.hasMany(models.Notification, {
      foreignKey: 'sourceId',
      as: 'notificationSource',
    });
    User.hasMany(models.Notification, {
      foreignKey: 'authorId',
      as: 'notificationOwner',
    });
  };
  return User;
};
