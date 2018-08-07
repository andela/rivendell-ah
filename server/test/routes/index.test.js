/* eslint-disable */

import chai, { expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import oAuthTest from './oauth.test'
import authTest from './auth.test'
import usersTest from './users.test';
import articlesTest from './article.test';
import rateArticlesTest from './rateArticles.test';
import models from '../../database/models';
chai.use(chaiHttp);

describe('Testing the index.js file', () => {
  after((done) => {
    models.sequelize.close();
  done();
  });
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
  authTest();
  oAuthTest()
  usersTest();
  articlesTest();
  rateArticlesTest();
});
