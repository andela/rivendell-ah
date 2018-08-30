import { describe, it, before } from 'mocha';
import { expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../index';
import mockData from './mockData';
import tokenService from '../../utils/services/tokenService';
import { User } from '../../database/models';

use(chaiHttp);

let slug;
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

          slug = res.body.article.slug;
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


describe('when users retrieve articles via GET(/api/article)', () => {
  describe('when articles exists in the database', () => {
    it('should return an articles array and each element should have a tags attribute', (done) => {
      request(server)
        .get(ARTICLE_ROUTE)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(200);
          expect(res.body)
            .property('articles');
          expect(res.body.articles[0])
            .to.be.an('object');
          expect(res.body.articles[0])
            .to.haveOwnProperty('tags');
          done();
        });
    });
  });
  describe('when a tag filter is specified', () => {
    it('should return tags that contain the specified letter', (done) => {
      request(server)
        .get(`${ARTICLE_ROUTE}?tag=${mockData.tags2[0]}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(200);
          expect(res.body)
            .property('articles');
          expect(res.body.articles[0])
            .to.be.an('object');
          expect(res.body.articles[0])
            .to.haveOwnProperty('tags');

          expect(res.body.articles[0].tags.indexOf(mockData.tags2[0]))
            .to.be.gte(0);
          done();
        });
    });
  });
});


describe('when users an article via GET(/api/article/:slug)', () => {
  describe('when the article exists in the database', () => {
    it('should return an articles array and each element should have a tags attribute', (done) => {
      request(server)
        .get(`${ARTICLE_ROUTE}/${slug}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(200);
          expect(res.body)
            .property('article');
          expect(res.body.article)
            .to.be.an('object');
          expect(res.body.article)
            .to.haveOwnProperty('tags');
          done();
        });
    });
  });
});
