module.exports = {
  /* eslint-disable  no-unused-vars */
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'johnDoe@mail.com',
    hash: '1qQw@123',
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),
  down:
  (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
