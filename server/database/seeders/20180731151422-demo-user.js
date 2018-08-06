/* eslint-disable */

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    firstName: 'John',
    lastName: 'Doe',
    username: 'John Doe',
    email: 'johnDoe@mail.com',
    hash: '12345678',
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),
  down:
  (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
