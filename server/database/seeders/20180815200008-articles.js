/* eslint-disable */
const uuid = require('uuid/v1');


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Articles', [
      {
      id: uuid(),
      title: 'article 1',
      description: 'article 1',
      body: 'article 1',
      slug: 'article-1-1',
      image: null,
      authorId: 'fbf941c0-aa8c-11e8-a375-d331f0a71365',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      title: 'article 3',
      description: 'article 2',
      body: 'article 4',
      slug: 'article-2-2',
      image: null,
      authorId: 'fbf941c0-aa8c-11e8-a375-d331f0a71365',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      title: 'article notification',
      description: 'article notification',
      body: 'article notification',
      slug: 'article-notification',
      image: null,
      authorId: 'fbf941c0-aa8c-11e8-a375-d331f0a71356',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ], {});
  },

  down: (queryInterface, Sequelize) => {
  },
};
