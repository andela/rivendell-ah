/* eslint-disable */
import chai from "chai";
import chaiHttp from "chai-http";
import { server } from "../../index";
import tokenService from "../../utils/services/tokenService";
import mockData from "./mockData";
import models from "../../database/models";

const { User } = models;
const { notificationUser4, notificationUser5, notificationUser6 } = mockData;

const { expect } = chai;
chai.use(chaiHttp);

let notificationUser4Id;
let notificationUser4Token;
let notificationUser5Id;
let notificationUser5Token;
let notificationUser6Id;
let notificationUser6Token;

describe('Testing subscribe routes', () => {
  before(done => {
    User.find({ where: { email: notificationUser4.email } }).then(user => {
      notificationUser4Id = user.id;
      notificationUser4Token = tokenService.generateToken(
        { id: user.id, email: user.email },
        "3d"
      );
      done();
    });
  });
  before(done => {
    User.find({ where: { email: notificationUser5.email } }).then(user => {
      notificationUser5Id = user.id;
      notificationUser5Token = tokenService.generateToken(
        { id: user.id, email: user.email },
        "3d"
      );
      done();
    });
  });
  before(done => {
    User.find({ where: { email: notificationUser6.email } }).then(user => {
      notificationUser6Id = user.id;
      notificationUser6Token = tokenService.generateToken(
        { id: user.id, email: user.email },
        "3d"
      );
      done();
    });
  });
  before(done => {
    chai
      .request(server)
      .post(`/api/profiles/${notificationUser4Id}/follow`)
      .set("Authorization", notificationUser6Token)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done();
      });
  });
  describe('Making a DELETE request to /notification/subscriptions/:id to unsubscribe from a user', () => {
    it('Should not let non-followers to unsubscribe', (done) => {
      chai.request(server)
        .delete(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser5Token)
        .send({
          subscriptionType: 'inApp'
        })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('you are not a follower');
          done();
        });
    });
    it('Should let the user unsubscribe if all checks pass', (done) => {
      chai.request(server)
        .delete(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser6Token)
        .send({
          subscriptionType: 'inApp'
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('Should not let non-subscribers to unsubscribe', (done) => {
      chai.request(server)
        .delete(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser6Token)
        .send({
          subscriptionType: 'inApp'
        })
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('you\'re not a subscriber');
          done();
        });
    });
  });
  describe('Making a POST request to /notification/subscriptions/:id to subscribe to a user', () => {
    it('Should throw an error 400 if no subscription type was passed', (done) => {
      chai.request(server)
        .post(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser5Token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('a subscriptionType is required');
          done();
        });
    });
    it('Should throw an error 400 if only spaces were passed as subscriptionType', (done) => {
      chai.request(server)
        .post(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser5Token)
        .send({
          subscriptionType: '   ',
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('subscriptionType can\'t be empty');
          done();
        });
    });
    it('Should throw an error 400 subscriptionType is neither inApp nor email', (done) => {
      chai.request(server)
        .post(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser5Token)
        .send({
          subscriptionType: 'yo',
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('only \'email\' and \'inApp\' are allowed in the field');
          done();
        });
    });
    it('Should throw an error 403 the user is not a follower', (done) => {
      chai.request(server)
        .post(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser5Token)
        .send({
          subscriptionType: 'email',
        })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('you are not a follower');
          done();
        });
    });
    it('Should return status code 204 if the user is already subscribed', (done) => {
      chai.request(server)
        .post(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser6Token)
        .send({
          subscriptionType: 'email',
        })
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body.errors).to.haveOwnProperty('message')
            .to.equal('you\'re already a subscriber');
          done();
        });
    });
    it('Should let the user subscribe', (done) => {
      chai.request(server)
        .post(`/api/notification/subscriptions/${notificationUser4Id}`)
        .set('Authorization', notificationUser6Token)
        .send({
          subscriptionType: 'inApp',
        })
        .end((err, res) => {
          expect(res.status).to.equal(201);
          done();
        });
    });
  });
});