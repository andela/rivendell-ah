
import { expect, use, request } from 'chai';
import { describe, it, before } from 'mocha';
import chaiHttp from 'chai-http';
import { server } from '../../index';
import mockData from './mockData';
import tokenService from '../../utils/services/tokenService';
import { User } from '../../database/models';

use(chaiHttp);

let token;
let slug;
let likeRoute;
let unverifiedToken;

describe('Testing likes routes /api/auth/:slug/like', () => {
  before((done) => {
    User.create(mockData.likeUser)
      .then((user) => {
        token = tokenService.generateToken(user.dataValues, 60 * 20);
        done();
      });
  });


  before((done) => {
    User.create(mockData.unverifiedUser)
      .then((user) => {
        unverifiedToken = tokenService.generateToken(user.dataValues, 60 * 20);
        done();
      });
  });
  // Create an article
  before((done) => {
    request(server)
      .post('/api/articles')
      .set('Authorization', token)
      .send({
        article: {
          title: 'Building a balance in life',
          description: 'Talks about the beautify  of family life',
          body: 'there is need for us to go home to our '
        + 'family as quick as we can. It is one way to keep ourselves happy and fulfiled',
        },
      })
      .end((err, res) => {
        const temp = res.body.article.slug;
        slug = temp;
        likeRoute = `/api/articles/${slug}/like`;
        done();
      });
  });


  
  describe('when like informations are retrieved when no one has liked the article', () => {
    it('should return a status code of 200 ', (done) => {
      request(server)
        .get(likeRoute)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res)
            .property('status').to.equal(200);
          done();
        });
    });
  });
  describe('when a user likes an aricle via POST /api/auth/:slug/like', () => {
    describe('when authentication is not provided ', () => {
      it('should return an error object in the body', (done) => {
        request(server)
          .post(likeRoute)
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

    describe('when authentication is provided ', () => {
      describe('when the slug value does not exists', () => {
        it('should return a status code of 404(Not found) and article informations', (done) => {
          request(server)
            .post('/api/articles/invalidSlud/like')
            .set('Authorization', token)
            .end((err, res) => {
              expect(res)
                .property('status').to.equal(404);
              expect(res.body)
                .property('errors')
                .property('message')
                .to.equal('Article with that slug was not found');
              done();
            });
        });
      });
      describe('when user has not liked the article', () => {
        it('should return a status code of 201', (done) => {
          request(server)
            .post(likeRoute)
            .set('Authorization', token)
            .end((err, res) => {
              expect(res)
                .property('status').to.equal(201);
              expect(res.body)
                .property('data').to.be.an('object');
              const { data } = res.body;

              expect(data)
                .property('author')
                .to.be.an('object');
              expect(data)
                .property('title')
                .to.be.an('string');
              expect(data)
                .property('slug')
                .to.be.a('string');
              expect(data)
                .property('id')
                .to.be.an('string');
              done();
            });
        });
      });
      describe('Making a request to /articles/favorites', () => {
        it('Should return the articles liked by a logged in user', (done) => {
          request(server)
            .get('/api/articles/favorites')
            .set('Authorization', token)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body).to.haveOwnProperty('favoriteArticles')
                .to.be.an('array')
              expect(res.body.favoriteArticles.length).to.be.greaterThan(0);
              done();
            });
        });
      })
      

      describe('when the user had liked the article', () => {
        it('should return a status code of 200 and article informations', (done) => {
          request(server)
            .post(likeRoute)
            .set('Authorization', token)
            .end((err, res) => {
              expect(res)
                .property('status').to.equal(200);
              expect(res.body)
                .property('data').to.be.an('object');
              const { data } = res.body;

              expect(data)
                .property('author')
                .to.be.an('object');
              expect(data)
                .property('title')
                .to.be.an('string');
              expect(data)
                .property('slug')
                .to.be.a('string');
              expect(data)
                .property('id')
                .to.be.an('string');
              done();
            });
        });
      });
    });
  });

  describe('when a user retrieves like information via GET /api/auth/:slug/like', () => {
    describe('when authentication is provided', () => {
      it('should return a status code of 200 and a data property', (done) => {
        request(server)
          .get(likeRoute)
          .set('Authorization', token)
          .end((err, res) => {
            expect(res)
              .property('status').to.equal(200);
            expect(res.body)
              .property('data').to.be.an('array');
            done();
          });
      });
      it('should return like informations in the data property', (done) => {
        request(server)
          .get(likeRoute)
          .set('Authorization', token)
          .end((err, res) => {
            const { data } = res.body;
            expect(data)
              .to.be.an('array');
            expect(res.body.totalLikes)
              .to.equal(data.length);
            done();
          });
      });

      describe('when  the user specifies a limit', () => {
        it('should return an array length less than or equal to the limit when limit is less than 20', (done) => {
          request(server)
            .get(`${likeRoute}?limit=3&page=2`)
            .set('Authorization', token)
            .end((err, res) => {
              const { data } = res.body;
              expect(data)
                .to.be.an('array');
              const validLength = data.length <= 3;
              expect(validLength)
                .to.be.true;
              done();
            });
        });
        it('should return an array length less than or equal to 20 when limit > 20', (done) => {
          request(server)
            .get(`${likeRoute}?limit=100000000`)
            .set('Authorization', token)
            .end((err, res) => {
              const { data } = res.body;
              expect(data)
                .to.be.an('array');
              const validLength = data.length <= 20;
              expect(validLength)
                .to.be.true;
              done();
            });
        });
      });
    });
  });

  describe('when a user dislikes an article via  DELETE /api/auth/:slug/like', () => {
    describe('when authentication is not provided', () => {
      it('should return a 401(Unauthorized', (done) => {
        request(server)
          .delete(likeRoute)
          .end((err, res) => {
            expect(res)
              .property('status').to.equal(401);
            done();
          });
      });
      it('should return an error object in the body', (done) => {
        request(server)
          .delete(likeRoute)
          .end((err, res) => {
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


    describe('when authentication is provided', () => {
      describe('when the user had  previously liked the article', () => {
        it('should return a status code of 200 and article informations', (done) => {
          request(server)
            .delete(likeRoute)
            .set('Authorization', token)
            .end((err, res) => {
              expect(res)
                .property('status').to.equal(204);
              done();
            });
        });
      });


      describe('when the slug value does not exists', () => {
        it('should return a status code of 404(Not found) and article informations', (done) => {
          request(server)
            .delete('/api/articles/invalidSlud/like')
            .set('Authorization', token)
            .end((err, res) => {
              expect(res)
                .property('status').to.equal(404);
              expect(res.body.errors)
                .property('message')
                .to.equal('The Article you specified does not exist');
              done();
            });
        });
      });
      describe('when the user had  previously liked the article', () => {
        it('should return a status code of 400 and article informations', (done) => {
          request(server)
            .delete(likeRoute)
            .set('Authorization', token)
            .end((err, res) => {
              expect(res)
                .property('status').to.equal(400);
              expect(res.body)
                .property('errors')
                .property('message')
                .to.equal('You had not previously liked the article');
              done();
            });
        });
      });
    });
  });
});
