/* eslint-disable */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categories', [
      {
        name: 'OTHERS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'TECH',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ENTERPRENEURSHIP',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'POLITICS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'SCIENCE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'CULTURE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ART',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'MUSIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'SPORTS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'FOODS',
        createdAt: new Date(),
        updatedAt: new Date(),
      }], {});
  },
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Categories', null, {}),
};
