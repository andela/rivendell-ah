import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';

import { User } from '../database/models'; //eslint-disable-line
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import OauthController from '../controllers/OauthController';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    ((email, password, done) => {
      User
        .findOne({ where: { email } })
        .then((user) => {
          if (!user) {
            return done(null, false);
          }

          const hash = crypto
            .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
            .toString('hex');
          if (!(hash === user.hash)) {
            return done(null, false);
          }
          return done(null, user);
        })
        .catch(done);
    }),
  ),
);


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'photos', 'email'],
}, OauthController.passportCallback));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, OauthController.passportCallback));


passport.use(new LinkedinStrategy({
  clientID: process.env.LINKEDIN_ID,
  clientSecret: process.env.LINKEDIN_SECRET,
  callbackURL: '/api/auth/linkedin/redirect',
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true,
}, OauthController.passportCallback));
