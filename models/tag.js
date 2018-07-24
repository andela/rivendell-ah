'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tag = sequelize.define('Tag', {
    title: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {});
  Tag.associate = function(models) {
    Tag.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return Tag;
};