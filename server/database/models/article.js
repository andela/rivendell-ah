
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'author',
    });
    Article.hasMany(models.ArticleLike, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'likes',
    });
  };
  return Article;
};
