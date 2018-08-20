import { describe, it, before } from 'mocha';
import { expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import mockData from './mockData';
import tokenService from '../../utils/services/tokenService';
import { User } from '../../database/models';

use(chaiHttp);


let token;
const ARTICLE_ROUTE = '/api/articles';

const article = mockData.article1;


before((done) => {
  User.findOne({
    where: { username: mockData.authorTag.username },
  }).then((user) => {
    token = tokenService.generateToken(user.dataValues, 60 * 20);
    done();
  });
});
describe('when an author creates an article with tags and authentication is not provided', () => {
  it('should return an error object in the body', (done) => {
    request(server)
      .post(ARTICLE_ROUTE)
      .send()
      .end((err, res) => {
        expect(res)
          .property('status').to.equal(401);
        expect(res.body)
          .to.be.an('object');
        expect(res.body)
          .property('errors')
          .property('message')
          .to.equal('Authentication failed');
        done();
      });
  });
});


describe('when an author creates an article with new tags and authentication is provided', () => {
  describe('when tags are less than 20', () => {
    it('should return an error object in the body', (done) => {
      article.tags = mockData.tags1;
      request(server)
        .post(ARTICLE_ROUTE)
        .set('Authorization', token)
        .send({ article })
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(201);
          expect(res.body)
            .to.be.an('object');
          expect(res.body)
            .property('article')
            .property('tags')
            .to.be.an('array');
          expect(res.body.article.tags.length <= 20)
            .to.be.true;
          done();
        });
    });
  });

  describe('when tags are less than 20', () => {
    it('should return an error object in the body', (done) => {
      article.tags = mockData.tags2;
      request(server)
        .post(ARTICLE_ROUTE)
        .set('Authorization', token)
        .send({ article })
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(201);
          expect(res.body.article.tags.length <= 20)
            .to.be.true;
          done();
        });
    });
  });
});
