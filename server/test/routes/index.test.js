/* eslint-disable */

import chai, { expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';

use(chaiHttp);

describe('Testing the index.js file', () => {
  describe('Navigating to a bad route', () => {
    it('Should return error 404 (not found)', (done) => {
      request(server)
        .get('/api/invalid_route')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});
