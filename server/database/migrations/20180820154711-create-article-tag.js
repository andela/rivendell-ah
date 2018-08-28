

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ArticleTags', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    articleId: {
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: 'Articles',
        key: 'id',
        as: 'articleId',
      },
    },
    tagId: {
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: 'Tags',
        key: 'id',
        as: 'tagId',
      },
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('ArticleTags'),
};
