/* eslint-disable */
import chai from 'chai'
import faker from 'faker'
import chaiHttp from 'chai-http'
import dotenv from 'dotenv';
import server from '../../index';
import models from '../../database/models';
import tokenService from '../../utils/services/tokenService';
import { User } from '../../database/models';
import mockData from './mockData';

const {user1, user2, user3} = mockData
const { expect } = chai;
const baseUrl = '/api/users/';
dotenv.config();
chai.use(chaiHttp);
let idTest; 

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
            password: 'R!vendell12',
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
    it('Should not verify user account if user is not registered (not in the userbase)', (done) => {
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
  });
  describe('Requesting for verification mail resend on route(/api/user/verify/resend-email)', () => {
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
    it('Should not resend email if provided email dose not exist in the userbase', (done) => {
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

  describe('Registering with no user inputs', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: '',
            username: '',
            password: '',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error.username[0]).to.equal('Please enter a username in the specified field');
          expect(res.body.error.username.length).to.equal(1);
          expect(res.body.error.email[0]).to.equal( 'Please enter an email in the specified field');
          expect(res.body.error.email.length).to.equal(1);
          expect(res.body.error.password[0]).to.equal('Please enter a password in the specified field');
          expect(res.body.error.password.length).to.equal(1);
          done();
        });
    });
  });

  describe('Registering with an invalid email', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'jennymail.com',
            username: 'jenny',
            password: '1qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error.email[0]).to.equal('Please enter a valid email');
          expect(res.body.error.email.length).to.equal(1);
          done();
        });
    });
  });

  describe('Registering with an invalid password with characters less than 8', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'jenny@mail.com',
            username: 'jenny',
            password: '1234@',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.password[0]).to.equal(
            'Your password must include an uppercase and lowercase alphabet, a number and a special character');
          expect(res.body.error.password[1]).to.equal('Password entered should have minimum of 8 characters');
          expect(res.body.error.password.length).to.equal(2);
          done();
        });
    });
  });

  describe('Registering with an invalid password with characters more than 20', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'jenny@mail.com',
            username: 'jenny',
            password: '12344444444443343444444434643543@',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error.password[0]).to.equal(
            'Your password must include an uppercase and lowercase alphabet, a number and a special character');
          expect(res.body.error.password[1]).to.equal('Password entered should have maximum of 20 characters');
          expect(res.body.error.password.length).to.equal(2);
          done();
        });
    });
  });

  describe('Registering with an already existing email', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'johnDoe@mail.com',
            username: 'jenny',
            password: '1qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error).to.equal('Email entered already exists');
          done();
        });
    });
  });

  describe('Registering with an already existing username', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'johnny@mail.com',
            username: 'John Doe',
            password: '1qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error).to.equal('Username entered already exists');
          done();
        });
    });
  });

  describe('Registering with an already existing username and email', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'johnDoe@mail.com',
            username: 'John Doe',
            password: '11qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error).to.equal('Email and Username entered already exists');
          done();
        });
    });
  });

  describe('TEST POST /users/api/forgot-password', () => {
    it('Should return Check your email for password reset token on success', (done) => {
      chai.request(server)
        .post('/api/users/forgot-password')
        .send({
          user: {
            email: mockData.user4.email
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('message')
            .to.equal('Check your email for password reset token');
          done();
        });
    });
    
    it('Should return undefined for missing email field', (done) => {
      chai.request(server)
        .post('/api/users/forgot-password')
        .send({
          user: {
            email: '',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error.email[0]).to.equal( 'Please enter an email in the specified field');
          expect(res.body.error.email.length).to.equal(1);
          done();
        });
    });
    it('Should return undefined for missing email field', (done) => {
      chai.request(server)
        .post('/api/users/forgot-password')
        .send({
          user: {
            email: 'jndnej',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error.email[0]).to.equal('Please enter a valid email');
          done();
        });
    });
    
    it('Should return user not found for unsaved email', (done) => {
      chai.request(server)
        .post('/api/users/forgot-password')
        .send({
          user: {
            email: mockData.user5.email
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found!');
          done();
        });
    });
  });

  describe('TEST GET /api/users/reset-password', () => {

    it('Should return success on a valid token', (done) => {
      const token = tokenService.generateToken({ username: mockData.user4.username, email: mockData.user4.email }, 60 * 30);
      chai.request(server)
        .get('/api/users/reset-password?token=' + token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('message')
            .to.equal('Verification Successful, You can now reset your password');
          done();
        });
    });

    it('Should return Invalid token', (done) => {
      chai.request(server)
        .get('/api/users/reset-password?token=jjiji')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Invalid token');
          done();
        });
    });
  });

  describe('TEST PUT /api/users/reset-password', () => {
    before((done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'fakeemail@gmail.com',
            username: 'fakeusername',
            password: '123456'
          }
        })
        .end((err, res) => {
          done();
        });
    });

    it('Should return undefined for a missing token field', (done) => {
      const token = tokenService.generateToken({ username: mockData.user4.username, email: mockData.user4.email }, 60 * 30);
      chai.request(server)
        .put('/api/users/reset-password')
        .send({
          user: {
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Token can not be undefined');
          done();
        });
    });

    it('Should return error for an empty token field', (done) => {
      const token = tokenService.generateToken({ username: mockData.user4.username, email: mockData.user4.email }, 60 * 30);
      chai.request(server)
        .put('/api/users/reset-password')
        .set('Authorization', '')
        .send({
          user: {
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Token can not be empty');
          done();
        });
    });
    it('Should return error for an invalid token', (done) => {
          const token = tokenService.generateToken({ username: mockData.user4.username, email: mockData.user4.email }, 60 * 30);
          chai.request(server)
            .put('/api/users/reset-password')
            .set('Authorization', 'hjjbjbj')
            .send({
              user: {
                password: '12345',
                confirm: '12345',
              }
            })
            .end((err, res) => {
              expect(res.status).to.equal(401);
              expect(res.body).to.haveOwnProperty('errors')
                .to.haveOwnProperty('message')
                .to.equal('Invalid token');
              done();
            });
        });

    it('Should return error for a missing and empty password field', (done) => {
      const token = tokenService.generateToken({ username: mockData.user4.username, email: mockData.user4.email }, 60 * 30);
      chai.request(server)
        .put('/api/users/reset-password')
        .set('Authorization', token)
        .send({
          user: {
            password: '',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status').equal('fail');
          expect(res.body.error.password[0]).to.equal('Please enter a password in the specified field');
          expect(res.body.error.password.length).to.equal(1);
          done();
        });
    });

    it('Should return error for password mismatch', (done) => {
    const token = tokenService.generateToken({
      username: mockData.user4.username, email: mockData.user4.email 
    },
    60 * 30);
    chai.request(server)
      .put('/api/users/reset-password')
      .set('Authorization', token)
      .send({
        user: {
          password: '12345Qh@',
          confirm: '12346',
        }
      })
      .end((err, res) => {
        expect(res.status).to.equal(409);
        expect(res.body).to.haveOwnProperty('errors')
          .to.haveOwnProperty('message')
          .to.equal('Password does not match');
        done();
      });
    });
    it('Should return password updated on success', (done) => {
    User.findOne({ where: { email: 'fattty@gmail.com' }})
      .then((user) => {
        idTest =user.id;
        const token = tokenService.generateToken(
          { 
            id: user.id 
          }, 60 * 20);
        chai.request(server)
          .put('/api/users/reset-password')
          .set('Authorization', token)
          .send({
            user: {
              password: '12345Qh@',
              confirm: '12345Qh@',
            }
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.haveOwnProperty('message')
              .to.equal('Password updated!');
            done();
          });
        })
    });
    it('Should return user not found for unsaved email', (done) => {
      const token = tokenService.generateToken(
        { 
          id: -166,
        }, 60 * 20);
      chai.request(server)
        .put('/api/users/reset-password')
        .set('Authorization', token)
        .send({
          user: { 
            password: 'cindsanf)0FSSC',
            confirm: 'cindsanf)0FSSC'
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found');
          done();
        });
    });
  });
});
