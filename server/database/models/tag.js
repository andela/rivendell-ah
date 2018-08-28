

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

  });
  Tag.associate = function (models) {
    Tag.belongsToMany(models.Article, {
      as: 'articles',
      through: 'ArticleTags',
      foreignKey: 'tagId',
    });
  };
  return Tag;
};
