/* eslint-disable max-len, prefer-destructuring */
import chai from 'chai';
import faker from 'faker';
import chaiHttp from 'chai-http';
import server from '../index';
import models from '../models';
import tokenService from '../services/tokenService';
import { User } from '../models';
import  mockData from './mockData';

const {user1, user2, user3} = mockData
require('dotenv').config();

const { expect } = chai;
chai.use(chaiHttp);

const baseUrl = '/api/users/';

describe('Testing user routes', () => {
  after((done) => {
    models.sequelize.close();
    done();
  });
  describe('Signing up with complete and valid credentials', () => {
    it('Should send a verification email to the user and return a success message', (done) => {
      chai.request(server)
        .post(baseUrl)
        .send({
          user: {
            username: 'username',
            password: '12345678',
            email: 'username12@gmail.com'
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.haveOwnProperty('message')
            .to.equal('Sign up successful, visit your email to verify your account.');
          done();
        });
    });
  });

  describe('Navigating to verification route(/api/user/verify/:token)', () => {
    it('Should not verify user if token is invalid', (done) => {
      chai.request(server)
        .get(`${baseUrl}verify/invalid-token`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('The link has expired');
          done();
        });
    });
    it('Should not verify user account if user is not registered (not in the database)', (done) => {
      const token = tokenService.generateToken({ id: 0 }, 60 * 20);
      chai.request(server)
        .get(`${baseUrl}verify/${token}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found in the database');
          done();
        });
    });
    it('Should not verify user account if account is already verified', (done) => {
      User.findOne({ where: { email: user2.email } })
        .then((user) => {
          const token = tokenService.generateToken({ id: user.id }, 60 * 20);
          return token;
        })
        .then((token) => {
          chai.request(server)
            .get(`${baseUrl}verify/${token}`)
            .end((err, res) => {
              expect(res.status).to.equal(409);
              expect(res.body).to.haveOwnProperty('errors')
                .to.haveOwnProperty('message')
                .to.equal('Your account has already been verified');
              done();
            });
        });
    });
    it('Should verify a user\'s account if the token is valid and the account hasn\'t been verified', (done) => {
      User.findOne({ where: { email: user1.email } })
        .then((user) => {
          const token = tokenService.generateToken({ id: user.id }, 60 * 20);
          return token;
        })
        .then((token) => {
          chai.request(server)
            .get(`${baseUrl}verify/${token}`)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body).to.haveOwnProperty('message')
                .to.equal('Your account has been verified');
              done();
            });
        });
    });
  }); describe('Requesting for verification mail resend on route(/api/user/verify/resend-email)', () => {
    it('Should not resend email if email was not provided', (done) => {
      chai.request(server)
        .post(`${baseUrl}verify/resend-email`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Email not provided');
          done();
        });
    });
    it('Should not resend email if provided email is not a valid email', (done) => {
      chai.request(server)
        .post(`${baseUrl}verify/resend-email`)
        .send({
          email: 'not-a-valid-email'
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Please provide a valid email');
          done();
        });
    });
    it('Should not resend email if provided email dose not exist in the database', (done) => {
      chai.request(server)
        .post(`${baseUrl}verify/resend-email`)
        .send({
          email: faker.internet.email()
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found in the database');
          done();
        });
    });
    it('Should resend an email if the user with the email exists and the account hasn\'t been verified', (done) => {
      chai.request(server)
        .post(`${baseUrl}verify/resend-email`)
        .send({
          email: user3.email
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('message')
            .to.equal('Your verification link has been resent');
          done();
        });
    });
  });
});
