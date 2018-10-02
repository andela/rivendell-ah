export default (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
      unique: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      required: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      required: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {});
  Article.associate = (models) => {
    Article.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author',
    });
    Article.hasMany(models.ArticleLike, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'likes',
    });

    Article.hasMany(models.Report, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'reports',
    });
    Article.hasMany(models.Comment, {
      as: 'comments',
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
    });
    Article.hasMany(models.Rating, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
      as: 'ratings',
    });
    Article.belongsToMany(models.Tag, {
      as: 'tags',
      through: 'ArticleTags',
      foreignKey: 'articleId',
    });
    Article.belongsTo(models.Subcategory, {
      foreignKey: 'subcategoryId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'subcategory',
    });
  };
  return Article;
};
