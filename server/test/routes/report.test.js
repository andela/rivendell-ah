
import { expect, use, request } from 'chai';
import { describe, it, before } from 'mocha';
import chaiHttp from 'chai-http';
import { server } from '../../index';
import mockData from './mockData';
import tokenService from '../../utils/services/tokenService';
import { User, Report, Article } from '../../database/models';

use(chaiHttp);

let token;
let slug;
let reportRoute;
let articleId;
const mockRequest = {
  type: 'plagiarism',
  description: 'This article was copied from the another site http://abc.com/1234-article',
};
describe('Testing the Report functionality', () => {
  before((done) => {
    User.findOrCreate({
      defaults: mockData.likeUser,
      where: { username: mockData.likeUser.username },
    })
      .then(([user]) => {
        token = tokenService.generateToken(user.dataValues, 60 * 20);
        done();
      });
  });


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
        articleId = res.body.article.id;
        reportRoute = `/api/articles/${slug}/report`;
        done();
      });
  });
  describe('Testing the migrations of the Report table', () => {
    it('should create a report that references a particular article', (done) => {
      Report.create({
        type: 'plagiarism',
        articleId,
        description: 'The article is a copy and paste',
      }).then(({ dataValues: report }) => {
        expect(report.type)
          .to.equal('plagiarism');
        expect(report.articleId)
          .to.equal(articleId);
        expect(report.id)
          .to.be.a('string');
        expect(report.id.length)
          .to.be.greaterThan(11);
        done();
      });
    });
  });
  describe('Testing report route /api/auth/:slug/report', () => {
    describe('when a user reports an article with a valid token and request body', () => {
      it('app should save the report in the database ', (done) => {
        request(server)
          .post(reportRoute)
          .set('Authorization', token)
          .send({
            report: mockRequest,
          })
          .end((err, res) => {
            expect(res.status)
              .to.equal(201);
            const { report } = res.body;
            expect(report)
              .haveOwnProperty('id')
              .to.be.a('string');
            expect(report)
              .haveOwnProperty('type')
              .to.equal(mockRequest.type);
            expect(report)
              .haveOwnProperty('description')
              .to.equal(mockRequest.description);
            const reportId = res.body.report.id;
            Report.findById(reportId)
              .then((foundReport) => {
                expect(foundReport)
                  .to.be.an('object');
                done();
              });
          });
      });
    });

    describe('when the properties are invalid', () => {
      it('should return an errors object that contains description when the description is less than 10', (done) => {
        request(server)
          .post(reportRoute)
          .set('Authorization', token)
          .send({
            report: {
              description: 'sml',
              type: 'validType',
            },
          })
          .end((err, res) => {
            expect(res.status)
              .to.equal(400);
            expect(res.body)
              .to.haveOwnProperty('errors')
              .to.be.an('object');
            const { errors } = res.body;
            expect(errors.description)
              .to.be.an('array');
            expect(errors.description.length)
              .to.be.greaterThan(0);
            done();
          });
      });
      it('should return an errors object that contains type when the type is less than 10', (done) => {
        request(server)
          .post(reportRoute)
          .set('Authorization', token)
          .send({
            report: {
              description: 'this can be as long as possible',
              type: 'sml',
            },
          })
          .end((err, res) => {
            expect(res.status)
              .to.equal(400);
            expect(res.body)
              .to.haveOwnProperty('errors')
              .to.be.an('object');
            const { errors } = res.body;
            expect(errors.type)
              .to.be.an('array');
            expect(errors.type.length)
              .to.be.greaterThan(0);
            done();
          });
      });


      it('should fail with an error when the report object is missing', (done) => {
        request(server)
          .post(reportRoute)
          .set('Authorization', token)
          .send()
          .end((err, res) => {
            expect(res.status)
              .to.equal(400);
            expect(res.body)
              .to.haveOwnProperty('errors')
              .to.be.an('object');
            const { errors } = res.body;
            expect(errors.message)
              .to.equal('report object is required');
            done();
          });
      });


      it('should fail with an error when the slug is invalid', (done) => {
        request(server)
          .post('/api/articles/invalidSlug/report')
          .set('Authorization', token)
          .send({ report: mockRequest })
          .end((err, res) => {
            expect(res.status)
              .to.equal(404);
            expect(res.body)
              .to.haveOwnProperty('errors')
              .to.be.an('object');
            const { errors } = res.body;
            expect(errors.message)
              .to.equal('The article with that slug was not found');
            done();
          });
      });
    });
  });
});
