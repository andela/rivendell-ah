const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const { expect } = chai;
chai.use(chaiHttp);

describe('Entry point', function() {
  describe('Navigating to a non-existing route', function() {
    it('Should return error 404', function(done) {
      chai.request(server)
        .get('/api/bad-route')
        .end(function(err, res) {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});