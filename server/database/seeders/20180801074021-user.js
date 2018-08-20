/* eslint-disable */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstName: 'John',
      lastName: 'Wick',
      username: 'black',
      email: 'johnwick@gmail.com',
      hash: '12345',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: 'Strawhat',
      lastName: 'Luffy',
      username: 'strawhat',
      email: 'strawhat@gmail.com',
      hash: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: 'Naruto',
      lastName: 'Uzumaki',
      username: 'naruto',
      email: 'naruto@gmail.com',
      hash: '12345',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'Charlie',
      lastName: 'Brown',
      username: 'charlieBrown',
      email: 'charlieBrown@gmail.com',
      hash: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'Charlie1',
      lastName: 'Brown1',
      username: 'charlieBrown1',
      email: 'charlieBrown1@gmail.com',
      hash: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'Mary',
      lastName: 'Jane',
      username: 'maryJane',
      email: 'maryJane@gmail.com',
      hash: '12345',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'Fatty',
      lastName: 'Lee',
      username: 'fattylee',
      email: 'fattty@gmail.com',
      hash: '12345',
      salt: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },{
      firstName: 'Gadath',
      lastName: 'Pillow',
      username: 'pillowgad',
      email: 'pillowgad@gmail.com',
      hash: '12345',
      salt: '12345',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },{
      firstName: 'Krista',
      lastName: 'Kolo',
      username: 'kolokris',
      email: 'kolokris@gmail.com',
      hash: '12345',
      salt: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },{
      firstName: 'Zebedee',
      lastName: 'Macus',
      username: 'zebedee',
      email: 'zebedee@gmail.com',
      hash: '12345',
      salt: '12345',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },{
      firstName: 'Tager',
      lastName: 'Author',
      username: 'authorTager',
      hash: 'R!vend1elLl121//',
      verified: true,
      email: 'authortager@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
  },
};
