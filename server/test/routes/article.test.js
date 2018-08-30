/* eslint-disable  */
import chai from 'chai'
import chaiHttp from 'chai-http'
import { server } from '../../index';
import tokenService from '../../utils/services/tokenService';
import mockData from './mockData';
import models from '../../database/models';

const { User } = models;

const mockTestUser = mockData.user7;

const { expect } = chai;
const baseUrl = '/api/articles/';
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
        }, '3d');
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
            body: 'A new body',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('article');
          slug = res.body.article.slug;
          done();
        });
    });
  });
  describe('Creating an Article with a subcategeory', () => {
    it('Should create an Article successfully with title, description and body specified', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A new title',
            description: 'A new description',
            body: 'A new body',
            subcategory: 'Fashion',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('article');
          done();
        });
    });
  });
  describe('Creating an Article with invalid integer value as subcategory', () => {
    it('Should return a 400(Bad Request) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A new title',
            description: 'A new description',
            body: 'A new body',
            subcategory: 1,
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.subcategory[0]).to.equal('Subcategory must be a string');
          done();
        });
    });
  });
  describe('Creating an Article with non-exisiting subcatgeory', () => {
    it('Should return a 400(Bad Request) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A new title',
            description: 'A new description',
            body: 'A new body',
            subcategory: 'efwegvi3uevg3q',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.errors.message).to.equal('Subcategory specified does not exist');
          done();
        });
    });
  });
  describe('Creating an Article with invalid parameters', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 1234,
            description: 1234,
            body: 12234,
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.title[0]).to.equal('Title must be a String');
          expect(res.body.errors.description[0]).to.equal('Description must be a String');
          expect(res.body.errors.body[0]).to.equal('Body must be a String');
          done();
        });
    });
  });

  describe('Creating an Article with no user inputs', () => {
    it('Should return a 400 error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('message')
            .to.equal('No data specified. No Article created');
          done();
        });
    })
  })
  describe('Creating an Article with no title', () => {
    it('Should return a 400 error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: '',
            description: 'A description',
            body: 'A body',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.title[0]).to.equal('Please specify a title for your Article');
          done();
        });
    })
  })
  describe('Creating an Article with no description', () => {
    it('Should return a 400 error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A title',
            description: '',
            body: 'A body',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.description[0]).to.equal('Please specify a description for your Article');
          done();
        });
    });
  });

  describe('Creating an Article with no body', () => {
    it('Should return a 400 error', (done) => {
      chai.request(server)
        .post(`${baseUrl}`)
        .send({
          article: {
            title: 'A title',
            description: 'A description',
            body: '',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.body[0]).to.equal('Please specify a body for your Article');
          done();
        });
    });
  });

  describe('Getting an Article', () => {
    it('Should return a particular article', (done) => {
      chai.request(server)
        .get(`${baseUrl}${slug}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    });
  });
  describe('Getting an Article with an invalid slug', () => {
    it('Should return 404(Not found) error', (done) => {
      chai.request(server)
        .get(`${baseUrl}wrong-slug`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.have.property('message')
            .to.equal('Article not found');
          done();
        });
    });
  });

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
    });
  });

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
    });
  });
  describe('Getting all Articles with pagination having invalid string values for limit and page', () => {
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
    });
  });
  describe('Getting all Articles with pagination having invalid negative values for limit and page', () => {
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
    });
  });

  describe('Getting Articles by  url Query String', () => {
    let creationDate, startDate, endDate;
    before('get articles', (done) => {
      chai.request(server)
        .get(`${baseUrl}`)
        .end((err, res) => {
          creationDate = res.body.articles[0].createdAt.split('T')[0];
          startDate = '2018-07-20';
          endDate = '2050-08-20';
          done();
        });
    });
    it('should return article(s) with date same as startDate only'
      + ' if no endDate is specified ', (done) => {
      chai.request(server)
        .get(`${baseUrl}?startDate=${creationDate}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles[0].createdAt.split('T')[0]).to.be.equals(creationDate);
          done();
        });
    });
    it('should return article(s) with subcategory fashion', (done) => {
      chai.request(server)
        .get(`${baseUrl}?subcategory=fashion`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles[0].subcategory.name).equal('FASHION');
          done();
        });
    });
    it('should return article(s) with date same as endDate only'
      + ' if no startDate is specified ', (done) => {
      chai.request(server)
        .get(`${baseUrl}?endDate=${creationDate}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles[0].createdAt.split('T')[0]).to.be.equals(creationDate);
          done();
        });
    });
    it('should return article(s) between the specified date range', (done) => {
      chai.request(server)
        .get(`${baseUrl}?startDate=${startDate}&endDate=${endDate}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          const lastIndex = res.body.articles.length - 1;
          expect(Date.parse(res.body.articles[lastIndex].createdAt))
            .to.be.gte(Date.parse(startDate));
          expect(Date.parse(res.body.articles[lastIndex].createdAt))
            .to.be.lte(Date.parse(endDate));
          done();
        });
    });
    it('should return article(s) by username like the query value', (done) => {
      chai.request(server)
        .get(`${baseUrl}?username=${mockTestUser.username}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(0);
          expect(res.body.articles[0].author.username).equals(mockTestUser.username);
          done();
        });
    });
    it('should return article(s) by firstname like the query value', (done) => {
      chai.request(server)
        .get(`${baseUrl}?firstName=${mockTestUser.firstName}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(0);
          done();
        });
    });
    it('should return article(s) by lastname like the query value', (done) => {
      chai.request(server)
        .get(`${baseUrl}?lastName=${mockTestUser.lastName}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(0);
          done();
        });
    });
    it('should return article(s) by title like the query value', (done) => {
      chai.request(server)
        .get(`${baseUrl}?title=A new title`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(0);
          expect(res.body.articles[0].title).equals('A new title');
          done();
        });
    });
    it('should return article(s) by description like the query value', (done) => {
      chai.request(server)
        .get(`${baseUrl}?description=A new description`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(0);
          expect(res.body.articles[0].title).equals('A new title');
          done();
        });
    });
    it('should return article(s) by body like the query value', (done) => {
      chai.request(server)
        .get(`${baseUrl}?body=A new body`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(0);
          expect(res.body.articles[0].title).equals('A new title');
          done();
        });
    });
    it('should default to return all articles (limited by pagination)'
      + 'if no filter query parameters is specified', (done) => {
      chai.request(server)
        .get(`${baseUrl}?limit=10`)
        .end((err, res) => {
          const count = res.body.articlesCount;
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          count < 20 ?
            expect(res.body.articles.length).to.be.equals(count)
            : expect(res.body.articles.length).to.be.equals(10);
          done();
        });
    });
    it('should ignore filter if invalid values are set'
      + ' to startDate and endDate fields', (done) => {
      chai.request(server)
        .get(`${baseUrl}?startDate=notvalid&endDate=invalidDate`)
        .end((err, res) => {
          const count = res.body.articlesCount;
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          count < 20 ?
            expect(res.body.articles.length).to.be.equals(count)
            : expect(res.body.articles.length).to.be.equals(10);
          done();
        });
    });
    it('should return an empty array if no article match query values', (done) => {
      chai.request(server)
        .get(`${baseUrl}?username=novaluematchesquery`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).equals(0);
          done();
        });
    });
    it('should ignore query fields if not valid', (done) => {
      chai.request(server)
        .get(`${baseUrl}?invalid=baduser`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles');
          expect(res.body.articles.length).to.be.gte(1);
          done();
        });
    });
  });
  describe('Updating an Article with new subcategory', () => {
    it('Should sucessfully update an Article with new title, description and body', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            subcategory: 'Fashion',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    });
  });
  describe('Updating an Article with invalid integer value as subcategory', () => {
    it('Should return a 400(Bad Request) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            subcategory: 1,
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.subcategory[0]).to.equal('Subcategory must be a string');
          done();
        });
    });
  });
  describe('Updating an Article with non-exisiting subcatgeory', () => {
    it('Should return a 400(Bad Request) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            subcategory: 'fewfgrwgeqgef2134@',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.errors.message).to.equal('Subcategory specified does not exist');
          done();
        });
    });
  });
  describe('Updating an Article with new title, description and body', () => {
    it('Should sucessfully update an Article with new title, description and body', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 'A updated title',
            description: 'A updated description',
            body: 'A updated body',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    });
  });
  describe('Updating an Article with new title and description only', () => {
    it('Should sucessfully update an Article with new title and description', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 'An updated title',
            description: 'An updated description',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    });
  });
  describe('Updating an Article with new title and body only', () => {
    it('Should sucessfully update an Article with new title and body', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 'An updated title',
            body: 'A new body update',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
          done();
        });
    });
  });
  describe('Updating an Article with new description and body only ', () => {
    it('Should sucessfully update an Article with new description and body', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            description: 'An updated description',
            body: 'A new body update',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('article');
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
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.have.property('message')
          .to.equal('No data specified. No update was made');
          done();
        });
    });
  });

  describe('Updating an Article with invalid parameters', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}${slug}`)
        .send({
          article: {
            title: 1234,
            description: 1234,
            body: 12234,
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.title[0]).to.equal('Title must be a String');
          expect(res.body.errors.description[0]).to.equal('Description must be a String');
          expect(res.body.errors.body[0]).to.equal('Body must be a String');
          done();
        });
    });
  });
  describe('Updating an Article with invalid an invalid slug', () => {
    it('Should return a 404(Not found) error', (done) => {
      chai.request(server)
        .put(`${baseUrl}Wrong-slug`)
        .send({
          article: {
            title: 'A title',
            description: 'A description',
            body: 'A body',
          },
        })
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.have.property('message')
            .to.equal('Article not found. Cannot Update');
          done();
        });
    });
  });
  describe('Deleting an Article', () => {
    it('Should sucessfully delete an Article', (done) => {
      chai.request(server)
        .delete(`${baseUrl}${slug}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
  });
  describe('Deleting an Article with an a wrong slug', () => {
    it('Should return a 404(Not found) error', (done) => {
      chai.request(server)
        .delete(`${baseUrl}wrong-slug`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.have.property('message')
            .to.equal('Article not found');
          done();
        });
    });
  });
});
