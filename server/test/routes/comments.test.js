/* eslint-disable */
import chai from 'chai'
import faker from 'faker'
import chaiHttp from 'chai-http'
import dotenv from 'dotenv';
import { server } from '../../index';
import models from '../../database/models';
import tokenService from '../../utils/services/tokenService';
import { User } from '../../database/models';
import mockData from './mockData';

const {
  megameUser1, megameUser2, megameArticle1,
  megameUser3,
} = mockData
const { expect } = chai;
const baseUrl = '/api/articles';
dotenv.config();
chai.use(chaiHttp);

let verifiedToken;
let verifiedToken1;
let unverifiedToken;
let commentId;
let replyId;
describe('Comment routes', () => {
  before((done) => {
    User.findOne({ where: { email: megameUser1.email } })
      .then((user) => {
        verifiedToken = tokenService.generateToken({ id: user.id }, 60 * 60);
        done();
      });
  });
  before((done) => {
    User.findOne({ where: { email: megameUser3.email } })
      .then((user) => {
        verifiedToken1 = tokenService.generateToken({ id: user.id }, 60 * 60);
        done();
      });
  });
  before((done) => {
    User.findOne({ where: { email: megameUser2.email } })
      .then((user) => {
        unverifiedToken = tokenService.generateToken({ id: user.id }, 60 * 60);
        done();
      });
  });
  before((done) => {
    chai.request(server)
      .post(`${baseUrl}/slug/comments`)
      .set({ authorization: verifiedToken })
      .send({
        comment: {
          body: 'hello'
        }
      })
      .end((err, res) => {
        done();
      });
  });
  describe('Making a POST request to /api/articles/:slug/comments in attempt to create a comment', () => {
    it('Should return error 403, for unverified users', (done) => {
      chai.request(server)
        .post(`${baseUrl}/slug/comments`)
        .set({ authorization: unverifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Your account has not been verified');
          done();
        });
    });
    it('Should return error 404, if the slug doesn\'t match an article in the DB', (done) => {
      chai.request(server)
        .post(`${baseUrl}/invalid-slug/comments`)
        .send({
          comment: {
            body: 'This is a comment'
          }
        })
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Article not found');
          done();
        });
    });
    it('Should return error 400, if no comment body was provided', (done) => {
      chai.request(server)
        .post(`${baseUrl}/slug/comments`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Comment body is required');
          done();
        });
    });
    it('Should return error 400, if no comment body is not a string', (done) => {
      chai.request(server)
        .post(`${baseUrl}/slug/comments`)
        .set({ authorization: verifiedToken })
        .send({
          comment: {
            body: 1,
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('commentBody')
          expect(res.body.errors.commentBody[0]).to.equal('Comment body must be a string');
          done();
        });
    });
    it('Should create the comment if all validations and verifications are successful', (done) => {
      chai.request(server)
      .post(`${baseUrl}/${megameArticle1.slug}/comments`)
      .send({
        comment: {
          body: 'This is a comment'
        }
      })
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body).to.haveOwnProperty('comment')
          .to.haveOwnProperty('body')
          .to.equal('This is a comment');
        commentId = res.body.comment.id;
        done();
      });
    });
  });

  describe('Making a POST request to /api/articles/:slug/comments/:id/replies in attempt to create a reply', () => {
    it('Should return error 404, if the slug doesn\'t match an article in the DB', (done) => {
      chai.request(server)
        .post(`${baseUrl}/invalid-slug/comments/1/replies`)
        .send({
          comment: {
            body: 'This is a comment'
          }
        })
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Article not found');
          done();
        });
    });
    it('Should create the reply if all validations and verifications are successful', (done) => {
      chai.request(server)
      .post(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}/replies`)
      .send({
        comment: {
          body: 'This is a reply'
        }
      })
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body).to.haveOwnProperty('comment')
          .to.haveOwnProperty('body')
          .to.equal('This is a reply');
        replyId = res.body.comment.id;
        done();
      });
    });
  });

  describe('Making a PUT request to /api/articles/:slug/comments/:id in attempt to update a comment', () => {
    it('Should return error 400, if no update was provided', (done) => {
      chai.request(server)
        .put(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('No update provided');
          done();
        });
    });
    it('Should return error 400, if no comment body is not a string', (done) => {
      chai.request(server)
        .put(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
        .set({ authorization: verifiedToken })
        .send({
          comment: {
            body: 1,
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('commentBody')
          expect(res.body.errors.commentBody[0]).to.equal('Comment body must be a string');
          done();
        });
    });
    it('Should only allow the owner of a comment to update it', (done) => {
      chai.request(server)
        .put(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
        .set({ authorization: verifiedToken1 })
        .send({
          comment: {
            body: 'an update',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Comment not found, or you do not have permission to update this comment');
          done();
        });
    });
    it('Should not update the comment if spaces or undefined was passed as the body', (done) => {
      chai.request(server)
      .put(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
      .send({
        comment: {
          body: '    '
        }
      })
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('comment')
          .to.haveOwnProperty('body')
          .to.equal('This is a comment');
        done();
      });
    });
    it('Should update the comment if all validations and checks were successful', (done) => {
      chai.request(server)
      .put(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
      .send({
        comment: {
          body: 'This is an update'
        }
      })
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('comment')
          .to.haveOwnProperty('body')
          .to.equal('This is an update');
        done();
      });
    });
  });

  describe('Making a GET request to api/articles/:slug/comments to get all comments of an article', () => {
    it('Should return an array of comments if all validations and checks were successful', (done) => {
      chai.request(server)
      .get(`${baseUrl}/${megameArticle1.slug}/comments`)
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('comments')
          .to.be.an('array');
        expect(res.body.comments.length)
          .to.be.greaterThan(0);
        done();
      });
    });
    it('Should return an array of comments matching the limit and page passed to url', (done) => {
      chai.request(server)
        .get(`${baseUrl}/${megameArticle1.slug}/comments?limit=1&page=1`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('comments')
            .to.be.an('array');
          expect(res.body.comments.length)
            .to.be.equal(1);
          done();
        });
    });
    it('Should return an empty array if the page specified goes beyond the amount of comments', (done) => {
      chai.request(server)
        .get(`${baseUrl}/${megameArticle1.slug}/comments?limit=10&page=10`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('comments')
            .to.be.an('array');
          expect(res.body.comments.length)
            .to.be.equal(0);
          done();
        });
    });
    it('Should return a 404 error if the slug specified does not belong to an article in the database', (done) => {
      chai.request(server)
        .get(`${baseUrl}/invalid-slug/comments`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Article not found');
          done();
        });
    });
  });

  describe('Making a GET request to api/articles/:slug/comments/:id/replies to get all replies of a comment', () => {
    before((done) => {
      chai.request(server)
        .post(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}/replies`)
        .set({ authorization: verifiedToken })
        .send({
          comment: {
            body: 'hello'
          }
        })
        .end((err, res) => {
          done();
        });
    });
    it('Should return a 404 error if the slug specified does not belong to an article in the database', (done) => {
      chai.request(server)
        .get(`${baseUrl}/invalid-slug/comments/${commentId}/replies`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Article not found');
          done();
        });
    });
    it('Should return an array of comments if all validations and checks were successful', (done) => {
      chai.request(server)
      .get(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}/replies`)
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('comments')
          .to.be.an('array');
        expect(res.body.comments.length)
          .to.be.greaterThan(0);
        done();
      });
    });
    it('Should return an array of comments matching the limit and page passed to url', (done) => {
      chai.request(server)
        .get(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}/replies?limit=1&page=1`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('comments')
            .to.be.an('array');
          expect(res.body.comments.length)
            .to.be.equal(1);
          done();
        });
    });
    it('Should return an empty array if the page specified goes beyond the amount of comments', (done) => {
      chai.request(server)
        .get(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}/replies?limit=10&page=10`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('comments')
            .to.be.an('array');
          expect(res.body.comments.length)
            .to.be.equal(0);
          done();
        });
    });
    it('Should return an empty arry if the comment has no reply', (done) => {
      chai.request(server)
      .get(`${baseUrl}/${megameArticle1.slug}/comments/${replyId}/replies`)
      .set({ authorization: verifiedToken })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('comments')
          .to.be.an('array');
        expect(res.body.comments.length)
          .to.equal(0);
        done();
      });
    });
  });

  describe('Making a DELETE request to api/articles/:slug/comments/:id to delete a comment', () => {
    it('Should return error 404, if the id does not exist in the comments table', (done) => {
      chai.request(server)
        .delete(`${baseUrl}/${megameArticle1.slug}/comments/9cc22b9e-cccc-aaaa-bbbb-41e796bab71e`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Comment not found');
          done();
        });
    });
    it('Should delete the comment if all validations and checks were successful', (done) => {
      chai.request(server)
        .delete(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(204);
          done();
        });
    });
  });

  describe('Making a GET request to api/articles/:slug/comments/:id to get a comment', () => {
    it('Should return error 404, if the id provided is not tied to a comment', (done) => {
      chai.request(server)
        .get(`${baseUrl}/${megameArticle1.slug}/comments/9cc22b9e-cccc-aaaa-bbbb-41e796bab71e`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Comment not found');
          done();
        });
    });
    it('Should get the comment if all validations and checks were successful', (done) => {
      chai.request(server)
        .get(`${baseUrl}/${megameArticle1.slug}/comments/${commentId}`)
        .set({ authorization: verifiedToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('comment')
            .to.haveOwnProperty('id')
            .to.equal(commentId);
          done();
        });
    });
  });
});