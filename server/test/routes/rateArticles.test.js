import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
/* eslint-disable */
const { expect } = chai;
chai.use(chaiHttp);
const author = {};
const reader = {};
const reader2 = {};
const reader3 = {};
const article = {};
const article2 = {};

const articlesTest = () => {
  describe('Article rating', () => {
    /**
     * create users to perform rating operations
     * create artcles to perform rating operations on
     */
    before((done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            firstName: 'myfitstname',
            lastName: 'mylastname',
            username: 'reader1',
            password: 'R!vendell12',
            email: 'reader1@gmail.com',
          },
        })
        .end((err, res) => {
          Object.assign(reader, res.body);
          done();
        });
    });

    before((done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            firstName: 'myfitstname',
            lastName: 'mylastname',
            username: 'reader2',
            password: 'R!vendell12',
            email: 'reader2@gmail.com',
          },
        })
        .end((err, res) => {
          Object.assign(reader2, res.body);
          done();
        });
    });

    before((done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            firstName: 'myfitstname',
            lastName: 'mylastname',
            username: 'anotheruser',
            password: 'R!vendell12',
            email: 'anotheruser12@gmail.com',
          },
        })
        .end((err, res) => {
          Object.assign(author, res.body);
          done();
        });
    });

    before((done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            firstName: 'myfitstname',
            lastName: 'mylastname',
            username: 'unverified',
            password: 'R!vendell12',
            email: 'unverified@gmail.com',
          },
        })
        .end((err, res) => {
          Object.assign(reader3, res.body);
          done();
        });
    });

    // verify the users accounts
    // users with verified account should not
    // perform actions on the database
    before((done) => {
      chai.request(server)
        .get(`/api/users/verify/${reader.user.token}`)
        .end((err, res) => {
          done();
        });
    });

    before((done) => {
      chai.request(server)
        .get(`/api/users/verify/${reader2.user.token}`)
        .end((err, res) => {
          done();
        });
    });

    before((done) => {
      chai.request(server)
        .get(`/api/users/verify/${author.user.token}`)
        .end((err, res) => {
          done();
        });
    });

    /**
     * create artcles to perform rating operations on
    */
    before((done) => {
      chai.request(server)
        .post('/api/articles')
        .set('Authorization', author.user.token)
        .send({
          article: {
            title: 'my most serious article',
            body: 'I am really in the mode to write right now',
            description: 'this is how I write',
          },
        })
        .end((err, res) => {
          Object.assign(article, res.body);
          done();
        });
    });

    before((done) => {
      chai.request(server)
        .post('/api/articles')
        .set('Authorization', author.user.token)
        .send({
          article: {
            title: 'The Andela Story',
            body: 'I am really in the mode to write right now. I want to tell the Andela story',
            description: 'This is andela',
          },
        })
        .end((err, res) => {
          Object.assign(article2, res.body);
          done();
        });
    });


    describe('users rate article', () => {
      it('unauthenticated users should not be able to rate an article', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', 'somethingrandomthatisrandom')
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('errors');
            expect(res.body.errors.message).to.equal('Authentication failed');
            done();
          });
      });

      it('unverified users should not be able to rate an article', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', `${reader3.user.token}`)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('errors');
            expect(res.body.errors.message).to.equal('Your account has not been verified');
            done();
          });
      });

      it('The authors should not be able to rate their articles', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', author.user.token)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('You can\'t provide ratings for your article');
            done();
          });
      });

      it('should not rate an article if no rating value is provided', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader.user.token)
          .send({
            rating: '',
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Invalid rating value');
            done();
          });
      });

      it('Rating for articles should not be more than 5', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader.user.token)
          .send({
            rating: 6,
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Invalid rating value');
            done();
          });
      });

      it('Rating for articles should not be less than 1', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader.user.token)
          .send({
            rating: 0.9,
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Invalid rating value');
            done();
          });
      });

      it('should not rate an article without the slug', (done) => {
        chai.request(server)
          .post('/api/articles/5/rating')
          .set('Authorization', reader.user.token)
          .send({
            rating: 4,
          })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Invalid request');
            done();
          });
      });

      it('should not rate the article if slug is not valid', (done) => {
        chai.request(server)
          .post('/api/articles/\' \'/rating')
          .set('Authorization', reader.user.token)
          .send({
            rating: 4,
          })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Invalid request');
            done();
          });
      });

      it('A login user should be able to rate an article after reading it', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader.user.token)
          .send({
            rating: 3,
          })
          .end((err, res) => {
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('ratingDetail');
            expect(res.body.rating).to.have.property('rating');
            done();
          });
      });

      it('A login user should be able to rate an article after reading it', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader2.user.token)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('ratingDetail');
            done();
          });
      });

      it('A login user should be able to rate an article only once', (done) => {
        chai.request(server)
          .post(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader.user.token)
          .send({
            rating: 4,
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Your rating have already been recoded');
            done();
          });
      });

      it('should return not found for article that does not exist', (done) => {
        chai.request(server)
          .post('/api/articles/no-body-wrote-it-746ee630-9db0-11e8-9616-311fb362c2cb/rating')
          .set('Authorization', reader.user.token)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Article not found');
            done();
          });
      });
    });

    /**
     * test for getting rating of articles by Id
     * rating values for tests below is gotten from
     * articles created from the post test above
     * get operation return not fount if article slug is not provided
     */
    describe('get rating for an article', () => {
      it('it should return the rating for the article with articleId', (done) => {
        chai.request(server)
          .get(`/api/articles/${article.article.slug}/rating`)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('ratingDetail');
            expect(res.body.ratingDetail.ratingCount).to.equal(2);
            expect(res.body.ratingDetail.averageRating).to.equal('4.00');
            done();
          });
      });

      it('should return not found for article that does not exist', (done) => {
        chai.request(server)
          .get('/api/articles/somerandomarticle/rating')
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Article not found');
            done();
          });
      });
    });

    /**
     * test ensure update operation on rating is done
     * sucessfully
     * cases cover
     * successful when field required are supllied
     * opeation will return not found if the article slug is not provided
     */
    describe('update article', () => {
      it('unverified users should not be able to update article rating', (done) => {
        chai.request(server)
          .put(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', `${reader3.user.token}`)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('errors');
            expect(res.body.errors.message).to.equal('Your account has not been verified');
            done();
          });
      });

      it('users should be able to update their ratings', (done) => {
        chai.request(server)
          .put(`/api/articles/${article.article.slug}/rating`)
          .set('Authorization', reader.user.token)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('ratingDetail');
            expect(res.body.rating.rating).to.equal(5);
            expect(res.body.ratingDetail.averageRating).to.equal('5.00');
            done();
          });
      });

      it('should return not found for article that does not exist', (done) => {
        chai.request(server)
          .put('/api/articles/i-do-not-know-who-create-it-746ee630-9db0-11e8-9616-311fb362c2cb/rating')
          .set('Authorization', reader.user.token)
          .send({
            rating: 5,
          })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('Article not found');
            done();
          });
      });
    });
  });
};

export default articlesTest;
