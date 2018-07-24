'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define('Comment', {
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      required: true,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
  }, {});
  Comment.associate = function(models) {
    Comment.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return Comment;
};