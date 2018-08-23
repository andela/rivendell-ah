/* eslint-disable */
import { describe, it } from 'mocha';
import { expect, use, request } from 'chai';
import chaiHttp from 'chai-http';

import server from '../../index';

use(chaiHttp);

describe('Social Login', () => {
  describe('when user tries to login with facebook', () => {
    it(`should redirect the user to facebook website and return 200`, (done) => {
  request(server)
    .get('/api/auth/facebook')
    .end((err, res) => {
     expect(res)
        .property('status').to.equal(200);
      done();
    });
    }).timeout(50000);
  });

  describe('when user accesses google redirect', () => {
    it(`should return 400 status`, (done) => {
      request(server)
        .get('/api/auth/google/redirect')
        .end((err, res) => {
         expect(res)
            .property('status').to.equal(400);
          done();
        });
    }).timeout(50000);
  });
  describe('when user tries to login with linkedin', () => {
    it('should redirect the user to linkedin and return 200', (done) => {
      request(server)
        .get('/api/auth/linkedin')
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(200);
          done();
        });
    }).timeout(50000);
  });
});
