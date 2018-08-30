import chai from 'chai';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import http from 'http';
import io from 'socket.io-client';
import ioBack from 'socket.io';
import MockedSocket from 'socket.io-mock';
import notificationService from '../../utils/services/notificationService';
import mockData from '../routes/mockData';
import models from "../../database/models";
import tokenService from '../../utils/services/tokenService';
import { server, app } from '../..';
import socketIoServiceHelper from '../../utils/helpers/socketIoServiceHelper';
let socket = new MockedSocket();

const { expect } = chai;
chai.use(chaiHttp);
dotenv.config();

const { User, Article, Notification, UserNotifications } = models;

const { notificationUser1, notificationUser2, notificationUser3, notifUser1Article } = mockData;

let notificationUser1Id;
let notificationUser1Token;
let notificationUser2Id;
let notificationUser2Token;
let notificationUser3Id;
let notificationUser3Token;
let notifUser1ArticleId;
let createArticle1Id;

describe('Testing for notification service', () => {
  after((done) => {
    models.sequelize.close();
    done();
  });
  before(done => {
    User.find({ where: { email: notificationUser1.email } }).then(user => {
      notificationUser1Id = user.id;
      notificationUser1Token = tokenService.generateToken(
        { id: user.id, email: user.email },
        "3d"
      );
      done();
    });
  });
  before(done => {
    User.find({ where: { email: notificationUser2.email } }).then(user => {
      notificationUser2Id = user.id;
      notificationUser2Token = tokenService.generateToken(
        { id: user.id, email: user.email },
        "3d"
      );
      done();
    });
  });
  before(done => {
    User.find({ where: { email: notificationUser3.email } }).then(user => {
      notificationUser3Id = user.id;
      notificationUser3Token = tokenService.generateToken(
        { id: user.id, email: user.email },
        "3d"
      );
      done();
    });
  });
  before(done => {
    Article.find({ where: { slug: notifUser1Article.slug } }).then(article => {
      notifUser1ArticleId = article.id;
      done();
    });
  });
  describe('Calling notify function', () => {
    before(done => {
      chai
        .request(server)
        .post(`/api/profiles/${notificationUser1Id}/follow`)
        .set("Authorization", notificationUser2Token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          done();
        });
    });
    before(done => {
      chai
        .request(server)
        .post(`/api/profiles/${notificationUser1Id}/follow`)
        .set("Authorization", notificationUser3Token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          done();
        });
    });
    it('Should save notification id with subscribers id on the userNotification table', (done) => {
      // socket.emit('client data', { id, token, socketId: 'hello'});
      notificationService.notify(notifUser1ArticleId, 'create article',
        notificationUser1Id, notificationUser1Id, notifUser1ArticleId, null)
        .then(() => {
          Notification.findOne({ where: { articleId: notifUser1ArticleId } })
            .then((notification) => {
              createArticle1Id = notification.id;
              expect(notification).to.not.be.null;
              expect(notification.type).to.equal('create article');
              expect(notification.entityId).to.equal(notifUser1ArticleId);
              done();
            });
        });
    });
    it('Should save notification id with subscribers id on the userNotification table', (done) => {
      notificationService.notify(notificationUser1Id, 'following',
        notificationUser3Id, notificationUser1Id, null, null)
        .then(() => {
          Notification.findOne({ where: { entityId: notificationUser1Id } })
            .then((notification) => {
              expect(notification).to.not.be.null;
              expect(notification.type).to.equal('following');
              expect(notification.entityId).to.equal(notificationUser1Id);
              done();
            });
        });
    });
  });
  describe('Testing readNotification function', () => {
    it('Should change a notification\'s read value to true when given the right params', (done) => {
      chai.request(server)
        .get(`/api/articles/${notifUser1Article.slug}?notificationId=${createArticle1Id}`)
        .set("Authorization", notificationUser3Token)
        .end((err, res) => {
          UserNotifications.findOne({ notificationId: createArticle1Id, userId: notificationUser3Id })
            .then((userNotification) => {
              setTimeout(() => {
                expect(userNotification).to.not.be.null;
                expect(userNotification.read).to.equal(true);
                done();
              }, 500);
            });
          done();
        });
    });
  });
  describe('Testing socketIoServiceHelper', () => {
    it('Should store a connected client in a global variable', (done) => {
      const id = notificationUser2Id
      let count = 0;
      const token = tokenService.generateToken({ id }, 60 * 20);
      socket.socketClient.on('notification', (notifications) => {
        count++;
        if (count > 1) {
          expect(notifications).to.be.an('array')
          expect(notifications.length).to.be.greaterThan(0);
          expect(global.clients).to.have.ownProperty(id);
          done();
        }
      })
      socketIoServiceHelper.fetchUserNotifications(socket);
      socket.socketClient.emit('fetch notifications', { id, token });
      socketIoServiceHelper.storeClientData(socket);
      socket.socketClient.emit('client data', { id, token, socketId: socket.socketClient.id });
    });
  });
});
