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

let user6Token;
describe('Testing user routes', () => {
  after((done) => {
    models.sequelize.close();
    done();
  });

  before((done) => {
    chai.request(server)
      .post(`${baseUrl}`)
      .send({
        user: {
          firstName: mockData.user6.firstName,
          lastName: mockData.user6.lastName,
          username: mockData.user6.username,
          email: mockData.user6.email,
          password: mockData.user6.password
          }
      })
      .end((err, res) => {
        user6Token = res.body.user.token;
        done();
      });
  });
  describe('Signing up with complete and valid credentials', () => {
    it('Should send a verification email to the user and return a success message', (done) => {
      chai.request(server)
        .post(baseUrl)
        .send({
          user: {
            firstName: 'Naruto',
            lastName: 'Uzumaki',
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
          expect(res.body.errors.username[0]).to.equal('Please enter a username in the specified field');
          expect(res.body.errors.username.length).to.equal(1);
          expect(res.body.errors.email[0]).to.equal( 'Please enter an email in the specified field');
          expect(res.body.errors.email.length).to.equal(1);
          expect(res.body.errors.password[0]).to.equal('Please enter a password in the specified field');
          expect(res.body.errors.password.length).to.equal(1);
          expect(res.body.errors.firstName[0]).to.equal('Please enter your first name in the specified field');
          expect(res.body.errors.lastName[0]).to.equal('Please enter your last name in the specified field');
          done();
        });
    });
  });

  describe('Registering with a first name with characters less than 2', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            firstName: 'a',
            email: 'jenny@mail.com',
            username: 'jenny',
            password: 'P@ssword1',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('firstName')
            .to.be.an('array');
          expect(res.body.errors.firstName[0]).to.equal('first name entered should have minimum of 2 characters');
          done();
        });
    });
  });

  describe('Registering with no input', () => {
    it('Should return error 400', (done) => {
      chai.request(server)
        .post('/api/users')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Please provide the required fields');
          done();
        });
    });
  });

  describe('Logging in with no input', () => {
    it('Should return error 400', (done) => {
      chai.request(server)
        .post('/api/users/login')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Please provide the required fields');
          done();
        });
    });
  });

  describe('Registering with a last name with characters less than 2', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            firstName: 'first',
            lastName: 'a',
            email: 'jenny@mail.com',
            username: 'jenny',
            password: 'P@ssword1',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('lastName')
            .to.be.an('array');
          expect(res.body.errors.lastName[0]).to.equal('last name entered should have minimum of 2 characters');
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
          expect(res.body.errors.email[0]).to.equal('Please enter a valid email');
          expect(res.body.errors.email.length).to.equal(1);
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
          expect(res.body.errors.password[0]).to.equal(
            'Your password must include an uppercase and lowercase alphabet, a number and a special character');
          expect(res.body.errors.password[1]).to.equal('Password entered should have minimum of 8 characters');
          expect(res.body.errors.password.length).to.equal(2);
          done();
        });
    });
  });

  describe('Registering with an invalid password with characters more than 100', () => {
    it('Should return a 400(Bad request) error', (done) => {
      chai.request(server)
        .post('/api/users')
        .send({
          user: {
            email: 'jenny@mail.com',
            username: 'jenny',
            password: `12344444444443343444444434643543@1234444444444334344444
            4434643543@12344444444443343444444434643543@12344444444443343444444434643543@`,
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors.password[0]).to.equal(
            'Your password must include an uppercase and lowercase alphabet, a number and a special character');
          expect(res.body.errors.password[1]).to.equal('Password entered should have maximum of 100 characters');
          expect(res.body.errors.password.length).to.equal(2);
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
            firstName: 'Naruto',
            lastName: 'Uzumaki',
            email: 'johnDoe@mail.com',
            username: 'jenny',
            password: '1qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors).to.haveOwnProperty('message')
            .to.equal('Email entered already exists');
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
            firstName: 'Naruto',
            lastName: 'Uzumaki',
            email: 'johnny@mail.com',
            username: 'johndoe',
            password: '1qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors).to.haveOwnProperty('message')
            .to.equal('Username entered already exists');
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
            firstName: 'Naruto',
            lastName: 'Uzumaki',
            email: 'johnDoe@mail.com',
            username: 'johndoe',
            password: '11qQw@123',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors).to.haveOwnProperty('message')
            .to.equal('Email and Username entered already exists');
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
          expect(res.body.errors.email[0]).to.equal( 'Please enter an email in the specified field');
          expect(res.body.errors.email.length).to.equal(1);
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
          expect(res.body.errors.email[0]).to.equal('Please enter a valid email');
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
            .to.equal('User not found');
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
          expect(res.body.errors.password[0]).to.equal('Please enter a password in the specified field');
          expect(res.body.errors.password.length).to.equal(1);
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
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found');
            done();
          });
      });
    });
  describe('Making a request to get a profile, GET \'/profiles/:username\'', () => {
    it('Should return error 404 if the provided username is not in the database', (done) => {
      chai.request(server)
        .get('/api/profiles/invalidUsername')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found');
          done();
        });
    });
    it('Should return a corresponding profile provided the provided username is in the database', (done) =>{
      chai.request(server)
        .get(`/api/profiles/${mockData.user1.username}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('profile')
            .to.haveOwnProperty('username')
            .to.equal(mockData.user1.username);
          done();
        });
    });
  });

  describe('Making a PUT request to /api/user to update a user/profile', () => {
    it('Should not grant the user access if the provided token is invalid', (done) => {
      chai.request(server)
        .put('/api/user')
        .set({ authorization: 'invalid-token' })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Authentication failed');
          done();
        });
    });
    it('Should not grant the user access if no token was provided', (done) => {
      chai.request(server)
        .put('/api/user')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Authentication failed');
          done();
        });
    });
    it('Should not let the user update the password field in the database if the provide password is not valid', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            password: 'invalid-password'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('password')
            .to.be.an('array');
          expect(res.body.errors.password[0])
          .to.equal('Your password must include an uppercase and lowercase alphabet, a number and a special character');
          done();
        });
    });
    it(`Should not let the user update the username,
      field in the database if the provide username is already taken`, (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            username: mockData.user1.username
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('Username provided is already taken');
          done();
        });
    });
    it('Should return error 404 if the email parsed from the token doesn\'t exist in the database', (done) => {
      const token = tokenService.generateToken({ email: 'invalidemail@gmail.com' }, 60 * 10 );
      chai.request(server)
        .put('/api/user')
        .set({ authorization: token })
        .send({
          user: {}
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('User not found');
          done();
        });
    });
    it('Should not throw an error if user provides his/her username unchanged', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            username: mockData.user6.username
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('user')
            .to.haveOwnProperty('username')
            .to.equal(mockData.user6.username);
          done();
        });
    });
    it('Should throw an error if the provided first name has characters less than 2', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            firstName: 'a'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('firstName')
            .to.be.an('array')
          expect(res.body.errors.firstName[0])
            .to.equal('first name entered should have minimum of 2 characters');
          done();
        });
    });
    it('Should throw an error if the provided last name has characters less than 2', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            lastName: 'a'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('lastName')
            .to.be.an('array')
          expect(res.body.errors.lastName[0])
            .to.equal('last name entered should have minimum of 2 characters');
          done();
        });
    });
    it('Should let the user update his/her profile, if the provided update passes all checks and validations', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            bio: 'this is it boiz'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('user')
            .to.haveOwnProperty('bio')
            .to.equal('this is it boiz');
          done();
        });
    });
    it('Should let the user update his/her profile, if the provided update passes all checks and validations', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            password: 'P@ssword12'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('user')
          done();
        });
    });
    it('Should let the user update his/her profile, if the provided update passes all checks and validations', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            image: 'image-link'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('user')
            .to.haveOwnProperty('image')
            .to.equal('image-link');
          done();
        });
    });
    it('Should let the user update his/her profile, if the provided update passes all checks and validations', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            lastName: 'lastName-update'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('user')
            .to.haveOwnProperty('lastName')
            .to.equal('lastName-update');
          done();
        });
    });
    it('Should let the user update his/her profile, if the provided update passes all checks and validations', (done) => {
      chai.request(server)
        .put('/api/user')
        .send({
          user: {
            firstName: 'firstName-update'
          }
        })
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.haveOwnProperty('user')
            .to.haveOwnProperty('firstName')
            .to.equal('firstName-update');
          done();
        });
    });
    it('Should return an error 400 if no update was provided', (done) => {
      chai.request(server)
        .put('/api/user')
        .set({ authorization: user6Token })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.haveOwnProperty('errors')
            .to.haveOwnProperty('message')
            .to.equal('No update data provided');
          done();
        });
    });
  });

  describe('Making a GET request to \'/profiles\'', () => {
    it('Should return an array of profiles(objects) matching the query strings', (done) => {
      chai.request(server)
        .get('/api/profiles?search=strawhat&limit=10&page=1')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array')
          expect(res.body[0].username).to.equal('strawhat');
          done();
        });
    });
    it('Should return an array of profiles(objects)', (done) => {
      chai.request(server)
        .get('/api/profiles')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          done();
        });
    });
  });
});
