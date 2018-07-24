'use strict';
module.exports = (sequelize, DataTypes) => {
  var Article = sequelize.define('Article', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      required: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      required: true,
    },
    tagList: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    
    favorited: {
      type: DataTypes.BOOLEAN,
    },
    favoritesCount: {
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    
  }, {});
  Article.associate = function(models) {
    Article.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return Article;
};