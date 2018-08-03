import passport from 'passport';
import { Strategy } from 'passport-local';
import crypto from 'crypto';
import models from '../models';

const { Users } = models;
const LocalStrategy = Strategy;

passport.use(
  new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]',
  },
  (email, password, done) => {
    Users.findOne({ where: { email } })
      .then((user) => {
        const validPassword = (thePassword) => {
          const hash = crypto
            .pbkdf2Sync(thePassword, user.salt, 10000, 512, 'sha512')
            .toString('hex');
          return user.hash === hash;
        };
        if (!user || !validPassword(password)) {
          return done(null, false, {
            errors: { 'email or password': 'is invalid' },
          });
        }
        return done(null, user);
      })
      .catch(done);
  }),
);
