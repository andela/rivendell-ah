import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../index';

const { expect } = chai;
const baseUrl = '/api/categories/';
chai.use(chaiHttp);

describe('Testing category routes', () => {
  describe('Getting all Catgeories of Articles',() => {
    it('Should get all categories of articles with corresponding subcategories', (done) => {
      chai.request(server)
        .get(`${baseUrl}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('categories');
          expect(res.body.categories.length).to.be.gte(0);
          done();
        });
    });
  });
});
