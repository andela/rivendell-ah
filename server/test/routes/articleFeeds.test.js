/* eslint-disable */
import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../index';

const { expect } = chai;
chai.use(chaiHttp);
// object hold users data as user and articles as an array
const userFollowing = {
  user: {},
  articles: []
};
const userToFollow1 = {
  user: {},
  articles: [],
};
const userToFollow2 = {
  user: {},
  articles: [],
};
const userToFollow3 = {
  user: {},
  articles: [],
};
const userNotFollowing = {
  user: {},
  articles: [],
};

describe('Testing Users feeds', () => {
  // users create their accounts
  before('create account user following others', (done) => {
    chai.request(server)
    .post('/api/users')
    .send({
      user: {
        firstName: 'fuserfollowing',
        lastName: 'luserfollowing',
        username: 'userfollowing',
        email: 'userfollowing@gmail.com',
        password: '123ABab??!'
      }
    })
    .end((err, res) => {
      Object.assign(userFollowing.user, res.body.user);
      done();
    });
  });
  before('create account for user to follow1', (done) => {
    chai.request(server)
    .post('/api/users')
    .send({
      user: {
        firstName: 'fuserTofollow1',
        lastName: 'luserTofollow1',
        username: 'userTofollow1',
        email: 'userTofollow1@gmail.com',
        password: '123ABab??!'
      }
    })
    .end((err, res) => {
      Object.assign(userToFollow1.user, res.body.user);
      done();
    });
  });
  before('create accout for user to follow2', (done) => {
    chai.request(server)
    .post('/api/users')
    .send({
      user: {
        firstName: 'fuserTofollow22',
        lastName: 'luserTofollow2',
        username: 'userTofollow2',
        email: 'userTofollow2@gmail.com',
        password: '123ABab??!'
      }
    })
    .end((err, res) => {
      Object.assign(userToFollow2.user, res.body.user);
      done();
    });
  });
  before('create accout for user to follow3', (done)=> {
    chai.request(server)
    .post('/api/users')
    .send({
      user: {
        firstName: 'fuserTofollow3',
        lastName: 'luserTofollow3',
        username: 'userTofollow3',
        email: 'userTofollow3@gmail.com',
        password: '123ABab??!'
      }
    })
    .end((err, res) => {
      Object.assign(userToFollow3.user, res.body.user);
      done();
    });
  });
  before('create accout for user not following', (done) => {
    chai.request(server)
    .post('/api/users')
    .send({
      user: {
        firstName: 'fuserNotfollowing',
        lastName: 'luserNotfollowing',
        username: 'userTNotfollowing',
        email: 'userNotfollowing@gmail.com',
        password: '123ABab??!'
      }
    })
    .end((err, res) => {
      Object.assign(userNotFollowing.user, res.body.user);
      done();
    });
  });

  // verify users account
  before('verify user following account', (done) => {
    chai.request(server)
    .get(`/api/users/verify/${userFollowing.user.token}`)
    .end((err, res) => {
      done();
    });
  });

  before('verify user to follow1 account', (done) => {
    chai.request(server)
    .get(`/api/users/verify/${userToFollow1.user.token}`)
    .end((err, res) => {
      done();
    });
  });

  before('verify user to follow2 account', (done) => {
    chai.request(server)
    .get(`/api/users/verify/${userToFollow2.user.token}`)
    .end((err, res) => {
      done();
    });
  });

  before('verify user to follow3 account', (done) => {
    chai.request(server)
    .get(`/api/users/verify/${userToFollow3.user.token}`)
    .end((err, res) => {
      done();
    });
  });

  before('verify user not following account', (done) => {
    chai.request(server)
    .get(`/api/users/verify/${userNotFollowing.user.token}`)
    .set('Authorization', userFollowing.user.token)
    .end((err, res) => {
      done();
    });
  });

  // following user
  before('user starting following user to follow 1', (done) => {
    chai.request(server)
    .post(`/api/profiles/${userToFollow1.user.id}/follow`)
    .set('Authorization', userFollowing.user.token) 
    .end((err, res) => {
      done();
    });
  });

  before('user starting following user to follow 1', (done) => {
    chai.request(server)
    .post(`/api/profiles/${userToFollow2.user.id}/follow`)
    .set('Authorization', userFollowing.user.token)
    .end((err, res) => {

      done();
    });
  });

  before('user starting following user to follow 1', (done) => {
    chai.request(server)
    .post(`/api/profiles/${userToFollow3.user.id}/follow`)
    .set('Authorization', userFollowing.user.token)
    .end((err, res) => {
      done();
    });
  });

  // users create articles
  before('user to follow1 create an article 1', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow1.user.token)
    .send({
      article: {
        title: 'following1 article1',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow1.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow1 create an article 2', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow1.user.token)
    .send({
      article: {
        title: 'following1 article2',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow1.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow2 create an article 1', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow2.user.token)
    .send({
      article: {
        title: 'following2 article1',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow2.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow2 create an article 2', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow2.user.token)
    .send({
      article: {
        title: 'following2 article2',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow2.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow2 create an article 3', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow2.user.token)
    .send({
      article: {
        title: 'following2 article3',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow2.articles.push(res.body.article);
      done();
    });
    
  });
  
  before('user to follow3 create an article 1', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow3.user.token)
    .send({
      article: {
        title: 'following3 article1',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow3.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow3 create an article 2', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow3.user.token)
    .send({
      article: {
        title: 'following3 article2',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow3.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow3 create an article 3', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow3.user.token)
    .send({
      article: {
        title: 'following3 article3',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow3.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow2 create an article 3', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow2.user.token)
    .send({
      article: {
        title: 'following2 article3',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow2.articles.push(res.body.article);
      done();
    });
    
  });

  before('user to follow1 create an article 3', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow1.user.token)
    .send({
      article: {
        title: 'following1 article3',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow1.articles.push(res.body.article);
      done();
    });
  });

  before('user to follow1 create an article 4', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow1.user.token)
    .send({
      article: {
        title: 'following1 article4',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow1.articles.push(res.body.article);
      done();
    });
  });

  before('user to follow3 create an article 4', (done) => {
    chai.request(server)
    .post('/api/articles')
    .set('Authorization', userToFollow3.user.token)
    .send({
      article: {
        title: 'following3 article4',
        description: 'if you like to follow',
        body:'you are following me because you like reading my articles',
      },
    })
    .end((err, res) => {
      userToFollow3.articles.push(res.body.article);
      done();
    });
  }); 

  describe('Getting users feeds', () => {
    it('should return an empty if user is not following any Author', (done) => {
      chai.request(server)
      .get('/api/users/feeds')
      .set('Authorization', userNotFollowing.user.token)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('feed');
        expect(res.body.feed).to.be.an('array');
        expect(res.body.feed.length).to.equal(0);
        done();
      });
    });

    it('it should an array of articles for authors the users is following', (done) => {
      chai.request(server)
      .get('/api/users/feeds')
      .set('Authorization', userFollowing.user.token)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('feed');
        expect(res.body.feed).to.be.an('array');

        // last created article should come first
        expect(res.body.feed[0].title).to.equal(userToFollow3.articles[3].title);
        done();
      });
    });

    it('it should an array of article within the limit specify in query', (done) => {
      chai.request(server)
      .get('/api/users/feeds?limit=15')
      .set('Authorization', userFollowing.user.token)
      .end((err, res) => {
        expect(res.status).to.equal(200);

        // default limit specify is 10
        expect(res.body).to.have.property('feed')
        expect(res.body.feed).to.be.an('array');
        expect(res.body.feed.length).to.be.at.least(10);
        // last created article should come first
        expect(res.body.feed[0].title).to.equal(userToFollow3.articles[3].title);
        done();
      });
    });
  });
});
