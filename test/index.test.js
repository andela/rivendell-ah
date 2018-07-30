const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

const { expect } = chai;
chai.use(chaiHttp);

describe('Testing the index.js file', () => {
  describe('Navigating to a bad route', () => {
    it('Should return error 404 (not found)', (done) => {
      chai.request(server)
        .get('/api/invalid_route')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});
