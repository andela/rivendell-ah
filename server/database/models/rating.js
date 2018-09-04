/* eslint-disable no-unused-vars */
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define(
    'Rating', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        reference: {
          model: 'User',
          key: 'id',
        },
      },
      articleId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        onDelete: 'CASCADE',
        reference: {
          model: 'Article',
          key: 'id',
        },
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['userId', 'articleId'],
        },
      ],
    },
  );

  Rating.associate = (models) => {
    // associate rating with article
    Rating.belongsTo(models.Article, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
      as: 'artticle',
    });
    // associate rating with user
    Rating.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      as: 'user',
    });
  };
  return Rating;
};
