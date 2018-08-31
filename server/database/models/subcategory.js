export default (sequelize, DataTypes) => {
  const Subcategory = sequelize.define('Subcategory', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
      unique: true,
    },
  }, {});
  Subcategory.associate = (models) => {
    Subcategory.hasMany(models.Article, {
      foreignKey: 'subcategoryId',
      as: 'articleSubcategories',
    });
    Subcategory.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'subcategory',
    });
  };
  return Subcategory;
};
