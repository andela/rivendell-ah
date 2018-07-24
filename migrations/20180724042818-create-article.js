'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Articles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        required: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        required: true,
      },
      tagList: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
      },
      
      favorited: {
        type: Sequelize.BOOLEAN,
      },
      favoritesCount: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Articles');
  }
};