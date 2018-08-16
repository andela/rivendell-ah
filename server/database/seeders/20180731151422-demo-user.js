/* eslint-disable */

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    firstName: 'John',
    lastName: 'Doe',
    username: 'John Doe',
    email: 'johnDoe@mail.com',
    hash: '1qQw@123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),
  down:
  (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
