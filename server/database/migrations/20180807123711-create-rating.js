module.exports = {
  /* eslint-disable no-unused-vars, arrow-body-style */
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Ratings', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        reference: {
          model: 'User',
          key: 'id',
          as: 'userId',
        },
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        reference: {
          model: 'Article',
          key: 'id',
          as: 'articleId',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Ratings'),
};
