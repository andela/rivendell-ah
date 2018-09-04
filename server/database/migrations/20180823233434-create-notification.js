/* eslint-disable */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      entityId: {
        type: Sequelize.UUID,
      },
      type: {
        type: Sequelize.ENUM(
          'create article', 'create comment', 'likes', 'following',
        ),
      },
      sourceId: {
        type: Sequelize.UUID,
      },
      authorId: {
        type: Sequelize.UUID,
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      commentId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Notifications');
  },
};
