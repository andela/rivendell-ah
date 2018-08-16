/* eslint-disable */
import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../../index';
import tokenService from '../../utils/services/tokenService';
import mockData from './mockData';

const testUser = mockData.user7; 

const { expect } = chai;
const baseUrl = '/api/articles/';
const SIGN_UP_ROUTE = '/api/users';
chai.use(chaiHttp);
let slug;

const articleTest = () => {
  describe('Testing articles routes', () => {
      let token = tokenService.generateToken(testUser, '3d');
        describe('Creating an Article', () => {
          it('Should create an Article sucessfully with title, description and/or body specified', (done) => {
              chai.request(server)
              .post(`${baseUrl}`)
              .send({
                  article:{
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
                  article:{
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
                  article:{
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
                  article:{
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
                  article:{
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
                  article:{
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
                  expect(res.body).to.have.property('message').equal('Article Found');
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
                  expect(res.body).to.have.property('status').equal('fail');
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
                  done();
                });
          })
        })

        describe('Updating an Article', () => {
          it('Should sucessfully update an Article', (done) => {
              chai.request(server)
              .put(`${baseUrl}${slug}`)
              .send({
                  article:{
                      title: 'A updated title',
                      description: 'A updated description',
                      body: 'A updated body'
                  }
              })
              .set('Authorization', token)
              .end((err, res) => {
                  expect(res.status).to.equal(200);
                  expect(res.body).to.have.property('article');
                  expect(res.body).to.have.property('message').equal('Article Updated');
                  done();
                });
          })
        })
        describe('Updating an Article with blank title', () => {
          it('Should return a 422(Unprocessible Entity) error', (done) => {
              chai.request(server)
              .put(`${baseUrl}${slug}`)
              .send({
                  article:{
                      title: '  ',
                      description: 'A new description',
                      body: 'A new body'
                  }
              })
              .set('Authorization', token)
              .end((err, res) => {
                  expect(res.status).to.equal(422);
                  expect(res.body).to.have.property('errors');
                  expect(res.body.errors).to.have.property('message').equal('The title must be specified');
                  done();
                });
          })
        })
      
        describe('Updating an Article with blank description', () => {
          it('Should return a 422(Unprocessible Entity) error', (done) => {
              chai.request(server)
              .put(`${baseUrl}${slug}`)
              .send({
                  article:{
                      title: ' A new title',
                      description: '   ',
                      body: 'A new body'
                  }
              })
              .set('Authorization', token)
              .end((err, res) => {
                  expect(res.status).to.equal(422);
                  expect(res.body).to.have.property('errors');
                  expect(res.body.errors).to.have.property('message').equal('The description must be specified');
                  done();
                });
          })
        })

        describe('Updating an Article with blank body', () => {
          it('Should return a 422(Unprocessible Entity) error', (done) => {
              chai.request(server)
              .put(`${baseUrl}${slug}`)
              .send({
                  article:{
                      title: ' A new title',
                      description: 'A new description',
                      body: '   '
                  }
              })
              .set('Authorization', token)
              .end((err, res) => {
                  expect(res.status).to.equal(422);
                  expect(res.body).to.have.property('errors');
                  expect(res.body.errors).to.have.property('message').equal('The body must be specified');
                  done();
                });
          })
        })
        describe('Updating an Article with no parameters', () => {
          it('Should return a 422(Unprocessible Entity) error', (done) => {
              chai.request(server)
              .put(`${baseUrl}${slug}`)
              .send({
                  article:{
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
                  article:{
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
                  article:{
                      title: 'A title',
                      description: 'A description',
                      body: 'A body'
                  }
              })
              .set('Authorization', token)
              .end((err, res) => {
                  expect(res.status).to.equal(404);
                  expect(res.body).to.have.property('status').equal('fail');
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
                  expect(res.body).to.have.property('message').equal('Article Deleted');
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
                  expect(res.body).to.have.property('status').equal('fail');
                  expect(res.body).to.have.property('message').equal('Unable to delete Article');
                  done();
                });
          })
        })
        describe('Getting Articles from an empty articles table', () => {
          it('Should 404(Bad request) error', (done) => {
              chai.request(server)
              .get(`${baseUrl}`)
              .end((err, res) => {
                  expect(res.status).to.equal(404);
                  expect(res.body).to.have.property('status').equal('fail');
                  expect(res.body).to.have.property('message').equal('No Articles found');
                  done();
                });
          })
        })
  })
}

export default articleTest;
