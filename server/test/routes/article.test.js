/* eslint-disable */
import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../../index';
import tokenService from '../../utils/services/tokenService';
import mockData from './mockData';
import models from '../../database/models';
const { User } = models;

const mockTestUser = mockData.user7;

const { expect } = chai;
const baseUrl = '/api/articles/';
const SIGN_UP_ROUTE = '/api/users';
chai.use(chaiHttp);
let slug;
let token;

describe('Testing articles routes', () => {
  before((done) => {
    User.findOne({ where: { email: mockTestUser.email } })
      .then((user) => {
        token = tokenService.generateToken({
          id: user.dataValues.id,
          email: user.dataValues.email,
        }, '3d') 
        done();
      });
  });
  describe('Creating an Article', () => {
    it('Should create an Article successfully with title, description and body specified', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A new title',
            description: 'A new description',
            body: 'A new body'
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('article');
          slug = res.body.article.slug;
          done();
        });
    })
  })
  describe('Creating an Article with invalid parameters', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 1234,
            description: 1234,
            body: 12234
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.title[0]).to.equal('Title must be a String');
          expect(res.body.error.description[0]).to.equal('Description must be a String');
          expect(res.body.error.body[0]).to.equal('Body must be a String');
          done();
        });
    })
  })

  describe('Creating an Article with no user inputs', () => {
    it('Should return a 422(Unprocessible Entity) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: '',
            description: '',
            body: ''
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('message').equal('No data specified. No Article created');
          done();
        });
    })
  })
  describe('Creating an Article with no user inputs', () => {
    it('Should return a 422(Unprocessible Entity) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: '',
            description: 'A description',
            body: 'A body'
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.title[0]).to.equal('Please specify a title for your Article');
          done();
        });
    })
  })
  describe('Creating an Article with no user inputs', () => {
    it('Should return a 422(Unprocessible Entity) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A title',
            description: '',
            body: 'A body'
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.description[0]).to.equal('Please specify a description for your Article');
          done();
        });
    })
  })

  describe('Creating an Article with no user inputs', () => {
    it('Should return a 422(Unprocessible Entity) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A title',
            description: 'A description',
            body: ''
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.body[0]).to.equal('Please specify a body for your Article');
          done();
        });
    })
  })

  describe('Getting an Article', () => {
    it('Should return a particular article', (done) => {
      chai.request(server)
        .get(`${baseUrl}${slug}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    })
  })
  describe('Getting an Article with an invalid slug', () => {
    it('Should return 404(Not found) error', (done) => {
      chai.request(server)
        .get(`${baseUrl}wrong-slug`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('message').equal('Article not found');
          done();
        });
    })
  })

  describe('Getting all Articles', () => {
    it('Should return all articles', (done) => {
      chai.request(server)
        .get(`${baseUrl}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body).to.have.property('articlesCount');
          done();
        });
    })
  })

  describe('Getting all Articles with pagination having limit=1 and page=1', () => {
    it('Should return one article in the first page', (done) => {
      chai.request(server)
        .get(`${baseUrl}?limit=1&page=1`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(1);
          expect(res.body).to.have.property('articlesCount');
          done();
        });
    })
  })
  describe('Getting all Articles with pagination having invalid limit and page', () => {
    it('Should return the default limit of 20 or the total no of articles if < 20 in default page 1', (done) => {
      chai.request(server)
        .get(`${baseUrl}?limit=veqvgef&page=eeffeq`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(1);
          expect(res.body).to.have.property('articlesCount');
          done();
        });
    })
  })
  describe('Getting all Articles with pagination having invalid limit and page', () => {
    it('Should return the default limit of 20 or the total no of articles if < 20 in default page 1', (done) => {
      chai.request(server)
        .get(`${baseUrl}?limit=-2&page=-1`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(1);
          expect(res.body).to.have.property('articlesCount');
          done();
        });
    })
  })

  describe('Updating an Article', () => {
    it('Should sucessfully update an Article', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 'A updated title',
            description: 'A updated description',
            body: 'A updated body'
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    })
  })
  describe('Updating an Article', () => {
    it('Should sucessfully update an Article with only title and description', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 'An updated title',
            description: 'An updated description',
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    })
  })
  describe('Updating an Article', () => {
    it('Should sucessfully update an Article with only title and body', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 'An updated title',
            body: 'A new body update',
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    })
  })
  describe('Updating an Article', () => {
    it('Should sucessfully update an Article with only description and body', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            description: 'An updated description',
            body: 'A new body update',
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    })
  })
  describe('Updating an Article with no parameters', () => {
    it('Should return a 422(Unprocessible Entity) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: '',
            description: '',
            body: ''
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('message').equal('No data specified. No update was made');
          done();
        });
    })
  })

  describe('Updating an Article with no request body', () => {
    it('Should return a 422(Unprocessible Entity) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send()
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('message').equal('No data specified. No update was made');
          done();
        });
    })
  })

  describe('Updating an Article with invalid parameters', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 1234,
            description: 1234,
            body: 12234
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.title[0]).to.equal('Title must be a String');
          expect(res.body.error.description[0]).to.equal('Description must be a String');
          expect(res.body.error.body[0]).to.equal('Body must be a String');
          done();
        });
    })
  })
  describe('Updating an Article with invalid an invalid slug', () => {
    it('Should return a 404(Not found) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}Wrong-slug`)
        .send({
          article: {
            title: 'A title',
            description: 'A description',
            body: 'A body'
          }
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('message').equal('Article not found. Cannot Update');
          done();
        });
    })
  })
  describe('Deleting an Article', () => {
    it('Should sucessfully delete an Article', (done) => {
      chai.request(server)
        .delete(`${baseUrl}${slug}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    })
  })
  describe('Deleting an Article with an a wrong slug', () => {
    it('Should return a 404(Not found) error', (done) => {
      chai.request(server)
        .delete(`${baseUrl}wrong-slug`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('message').equal('Article not found');
          done();
        });
    })
  })
})
