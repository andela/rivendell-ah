

module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    type: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {});
  Report.associate = function (models) {
    Report.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article',
    });
  };
  return Report;
};
