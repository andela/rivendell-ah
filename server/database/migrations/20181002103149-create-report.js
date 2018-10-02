'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaults: Sequelize.UUIDV4,
      },
      type: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        reference: {
          model: 'Article',
          key: 'id',
          as: 'articleId',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Reports');
  }
};