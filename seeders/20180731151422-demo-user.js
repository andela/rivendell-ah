

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    username: 'John Doe',
    email: 'johnDoe@mail.com',
    hash: '12345678',
    createdAt: new Date(),
    updatedAt: new Date()
  }], {}),
  // eslint-disable-next-line  no-unused-vars
  down:
  (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {})
};
