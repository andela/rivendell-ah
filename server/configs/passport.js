
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';

import { User } from '../database/models'; //eslint-disable-line


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
            return done(null, false, {
              errors: { email: 'is invalid' },
            });
          }

          const hash = crypto
            .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
            .toString('hex');
          if (!(hash === user.hash)) {
            return done(null, false, {
              errors: { password: 'is invalid' },
            });
          }
          return done(null, user);
        })
        .catch(done);
    }),
  ),
);
