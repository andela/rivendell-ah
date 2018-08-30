/* eslint-disable */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Follows", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      followingId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id"
        }
      },
      followerId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id"
        }
      },
      inApp: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      inApp: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    return queryInterface.dropTable("Follows");
  }
};
