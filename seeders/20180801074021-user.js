'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'black',
      email: 'johnwick@gmail.com',
      hash: '12345',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'strawhat',
      email: 'strawhat@gmail.com',
      hash: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'naruto',
      email: 'naruto@gmail.com',
      hash: '12345',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
  }
};
