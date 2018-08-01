const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

const { expect } = chai;
chai.use(chaiHttp);

describe('Testing the index.js file', () => {
  describe('Navigating to a bad route', () => {
    it('Should return error 404 (not found)', (done) => {
      chai.request(server)
        .get('/v1/api/invalid_route')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
  describe('Navigating to a default route', () => {
    it('Should respond with: Author\'s Haven is up and running', (done) => {
      chai.request(server)
        .get('/v1/api/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('Author\'s Haven is up and running')
          done();
        });
    });
  });
});
