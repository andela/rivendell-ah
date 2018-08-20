/* eslint-disable */
import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../../index';
import tokenService from '../../utils/services/tokenService';
import mockData from './mockData';
import models from '../../database/models';

const { User } = models;

const { expect } = chai;
chai.use(chaiHttp);

let { author3, follow5, follow7, follow8, unverified, followerProfile, followingProfile } = mockData;

let follow7Token, follow8Token, follow5Token, author3Token, unverifedToken;

before((done) => {
  User.find({ where: { email: follow7.email }})
    .then((user) => {
      follow7Token = tokenService.generateToken({ id: user.id, email: user.email }, '3d');
      done();
    })
});

before((done) => {
  User.find({ where: { email: follow8.email }})
    .then((user) => {
      follow8Token = tokenService.generateToken({ id: user.id, email: user.email }, '3d');
      done();
    })
});

before((done) => {
  User.find({ where: { email: follow5.email }})
    .then((user) => {
      follow5Token = tokenService.generateToken({ id: user.id, email: user.email }, '3d');
      done();
    })
});

before((done) => {
  User.find({ where: { email: author3.email }})
    .then((user) => {
      author3Token = tokenService.generateToken({ id: user.id, email: user.email }, '3d');
      done();
    })
});

before((done) => {
  User.find({ where: { email: unverified.email }})
    .then((user) => {
      unverifedToken= tokenService.generateToken({ id: user.id, email: user.email }, '3d');
      done();
    })
});

describe('Test for follow/unfollow endpoints', () => {
  before((done) => {
    chai.request(server)
      .post(`/api/profiles/${author3.id}/follow`)
      .set('Authorization', follow7Token)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done();
      });
  });

  describe('Follow an Author', () => {
    it('should not be able follow an author if not login ', (done) => {
      chai.request(server)
        .post('/api/profiles/0/follow')
        .set('Authorization', null)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Authentication failed');
          done();
        });
    })
    it('should not be able to follow a user if account has not been verified', (done) => {
      chai.request(server)
        .post(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', unverifedToken)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Your account has not been verified');
          done();
        });
    })
    it('should return error message with 404 status if user is not registered', (done) => {
      chai.request(server)
        .post(`/api/profiles/0/follow`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('User not found');
          done();
        });
    });
    it('should be able to follow another author after login', (done) => {
      chai.request(server)
        .post(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', follow5Token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('profile')
            .which.have.property('following')
            .that.is.equals(true);
          done();
        });
    })
    it('should not perform the follow operation if already following  the user', (done) => {
      chai.request(server)
        .post(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('You are already following this User');
          done();
        });
    })
    it('should not be able to follow itself', (done) => {
      chai.request(server)
        .post(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', author3Token)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('You cannot follow yourself');
          done();
        });
    })
  })

  describe('Unfollow an Author', () => {
    it('should not be able unfollow an author if not login ', (done) => {
      chai.request(server)
        .delete('/api/profiles/0/follow')
        .set('Authorization', 'not login')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Authentication failed');
          done();
        });
    })
    it('should not be able to unfollow a user if account has not been verified', (done) => {
      chai.request(server)
        .delete(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', unverifedToken)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Your account has not been verified');
          done();
        });
    })
    it('should return error message with 404 status if user is not registered', (done) => {
      chai.request(server)
        .delete(`/api/profiles/0/follow`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('User not found');
          done();
        });
    });
    it('should be able to unfollow another user', (done) => {
      chai.request(server)
        .delete(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('profile')
            .which.have.property('following')
            .that.is.equals(false);
          done();
        });
    })
    it('should not unfollow an author you are not following', (done) => {
      chai.request(server)
        .delete(`/api/profiles/${follow8.id}/follow`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('You are not following this author');
          done();
        });
    })
  })
  describe('Followers route GET /profiles/:authorId/followers', () => {
    it('should return error message with 404 status if user is not registered', (done) => {
      chai.request(server)
        .get(`/api/profiles/0/followers`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('User not found');
          done();
        });
    });
    it('should not be able to view followers if account has not been verified', (done) => {
      chai.request(server)
        .get(`/api/profiles/${author3.id}/followers`)
        .set('Authorization', unverifedToken)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Your account has not been verified');
          done();
        });
    })
    it('should not be able get followers if not login', (done) => {
      chai.request(server)
        .get(`/api/profiles/${author3.id}/followers`)
        .set('Authorization', null)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Authentication failed');
          done();
        });
    })
    it('should return error message with status 404 if no follower is found', (done) => {
      chai.request(server)
        .get(`/api/profiles/${follow8.id}/followers`)
        .set('Authorization', follow8Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('This user does not have any follower');
          done();
        });
    });
    it('should return an array of users profile that are following an author', (done) => {
      chai.request(server)
        .get(`/api/profiles/${author3.id}/followers`)
        .set('Authorization', author3Token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('followers')
            .which.is.an('Array')
            .that.have.deep.members([followerProfile]);
          done();
        });
    });
    it('should return error message with status 404 if no follower is found', (done) => {
      chai.request(server)
        .get(`/api/followers`)
        .set('Authorization', follow8Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('You don\'t have any follower');
          done();
        });
    });
    it('should return an array of users profile that are following an author', (done) => {
      chai.request(server)
        .get(`/api/followers`)
        .set('Authorization', author3Token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('followers')
            .which.is.an('Array')
            .that.have.deep.members([followerProfile]);
          done();
        });
    });
  });

  describe('Followings route GET /profiles/:userId/followings', () => {
    before((done) => {
      chai.request(server)
        .post(`/api/profiles/${follow8.id}/follow`)
        .set('Authorization', author3Token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          done();
        });
    });
    it('should not be able get followers if not login', (done) => {
      chai.request(server)
        .get(`/api/profiles/${author3.id}/followings`)
        .set('Authorization', null)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Authentication failed');
          done();
        });
    })
    it('should return error message with 404 status if user is not registered', (done) => {
      chai.request(server)
        .get(`/api/profiles/0/followings`)
        .set('Authorization', follow7Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('User not found');
          done();
        });
    });
    it('should not be able to view those following a user if account has not been verified', (done) => {
      chai.request(server)
        .post(`/api/profiles/${author3.id}/follow`)
        .set('Authorization', unverifedToken)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('Your account has not been verified');
          done();
        });
    })
    it('should return error message with status 404 if you are not following anyone', (done) => {
      chai.request(server)
        .get(`/api/profiles/${follow8.id}/followings`)
        .set('Authorization', follow8Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('This user is not following anyone');
          done();
        });
    });
    it('should return error message with status 404 if you are not following anyone', (done) => {
      chai.request(server)
        .get(`/api/followings`)
        .set('Authorization', follow8Token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.have.property('errors')
            .which.to.have.property('message')
            .that.is.equals('You are not following anyone');
          done();
        });
    });
    it('should return an array of users profile that a user is following', (done) => {
      chai.request(server)
        .get(`/api/profiles/${author3.id}/followings`)
        .set('Authorization', author3Token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('followings')
            .which.is.an('Array')
            .that.have.deep.members([followingProfile]);
          done();
        });
    });
    it('should return an array of users profile that a user is following', (done) => {
      chai.request(server)
        .get(`/api/followings`)
        .set('Authorization', author3Token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('followings')
            .which.is.an('Array')
            .that.have.deep.members([followingProfile]);
          done();
        });
    });
  });
})
