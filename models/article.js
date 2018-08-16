

export default (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    });
  };
  return Article;
};
