/* eslint-disable */

import chai, { expect, use, request } from 'chai';

import { describe, it, before } from 'mocha';
import { internet, name } from 'faker';
import chaiHttp from 'chai-http';
import { server } from '../../index';

const SIGN_UP_ROUTE = '/api/users';
const LOGIN_ROUTE = '/api/users/login';
use(chaiHttp);


const tempUser = {
  user: {
    firstName: 'Naruto',
    lastName: 'Uzumaki',
    username: 'usename10101111',
    email: 'thisafakeemail@email.com',
    password: '11qQw@123',
  },
};

describe('user test', () => {
  describe('user on signing up', () => {
    describe('signing up with no username', () => {
      it('should return a 400 status code without token', (done) => {
        request(server)
          .post(SIGN_UP_ROUTE)
          .send({
            user: {
              email: 'testmail@mail.com',
              password: '1qQw@123',
            },
          })
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body)
              .to.not.have.property('data');
            done();
          });
      });
    });


    describe('signing up with no email', () => {
      it('should return a 400 status code without token', (done) => {
        request(server)
          .post(SIGN_UP_ROUTE)
          .send({
            user: {
              username: name.lastName() + Date.now(),
              password: '1qQw@123',
            },
          })
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body)
              .to.not.have.property('data');
            done();
          });
      });
    });

    describe('signing up with no password', () => {
      it('should return a 400 status code without token', (done) => {
        request(server)
          .post(SIGN_UP_ROUTE)
          .send({
            user: {
              username: name.lastName() + Date.now(),
              email: 'testmail@mail.com',
            },
          })
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body)
              .to.not.have.property('data');
            done();
          });
      });
    });


    describe('signing up with all the required fields', () => {
      it('should return a 201 status code has a data property with a token',
        (done) => {
          request(server)
            .post(SIGN_UP_ROUTE)
            .send({
              user: {
                firstName: 'Naruto',
                lastName: 'Uzumaki',
                email: 'testmail@mail.com',
                username: `validUser1010${Date.now()}`,
                password: '1qQw@123',
              },
            })
            .end((err, res) => {
              expect(res.status).to.equal(201);
              expect(res.body).to.haveOwnProperty('user');
              expect(res.body.user).to.haveOwnProperty('token');
              done();
            });
        });
    });
  });


  describe('user on loging in ', () => {
    before((done) => {
      request(server)
        .post(SIGN_UP_ROUTE)
        .send(tempUser)
        .end(() => {
          done();
        });
    });

    describe('loging in with no username', () => {
      it('should not return  a data property', (done) => {
        request(server)
          .post(LOGIN_ROUTE)
          .send({
            user: {
              email: 'testmail@mail.com',
              password: '1qQw@123',
            },
          })
          .end((err, res) => {
            expect(res.body)
              .to.not.have.property('data');
            done();
          });
      });
    });

    describe('loging in with no password', () => {
      it('should not return a data property ', (done) => {
        request(server)
          .post(LOGIN_ROUTE)
          .send({
            user: {
              email: 'testmail@mail.com',
              username: name.lastName() + Date.now(),
            },
          })
          .end((err, res) => {
            expect(res.body)
              .to.not.have.property('data');
            done();
          });
      });
    });


    describe('loging in with no email', () => {
      it('should not return a data property ', (done) => {
        request(server)
          .post(LOGIN_ROUTE)
          .send({
            user: {
              username: name.lastName() + Date.now(),
              password: '1qQw@123',
            },
          })
          .end((err, res) => {
            expect(res.body)
              .to.not.have.property('data');
            done();
          });
      });
    });


    describe('loging in a user with an invalid format', () => {
      describe('if only the user attributes are missing', () => {
        it('should not return a data property',
          (done) => {
            request(server)
              .post(LOGIN_ROUTE)
              .send({
                user: {},
              })
              .end((err, res) => {
                expect(res.body)
                  .to.not.have.property('data');
                done();
              });
          });
      });

      describe('if only the user attributes are missing', () => {
        it('should not return a data property',
          (done) => {
            request(server)
              .post(LOGIN_ROUTE)
              .send({
                user: {},
              })
              .end((err, res) => {
                expect(res.body)
                  .to.not.have.property('data');
                done();
              });
          });
      });
    });

    describe('loging in with an invalid user ', () => {
      it('should return a 200 status code has a data property with a token',
        (done) => {
          request(server)
            .post(LOGIN_ROUTE)
            .send({
              user: {
                username: name.lastName() + Date.now(),
                password: '1qQw@123',
                email: 'testmaily@mail.com',
              },
            })
            .end((err, res) => {
              expect(res.body)
                .to.not.have.property('data');
              done();
            });
        });
    });

    describe('loging in with all the required fields', () => {
      it('should return a 200 status code has a data property with a token',
        (done) => {
          request(server)
            .post(LOGIN_ROUTE)
            .send(tempUser)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body).to.haveOwnProperty('user');
              expect(res.body.user).to.haveOwnProperty('token');
              done();
            });
        });
    });
  });
});
