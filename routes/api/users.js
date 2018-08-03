import passport from 'passport';
import { Router } from 'express';
import models from '../../models';
import tokenService from '../../services/tokenService';
import verificationHelper from '../../helpers/verificationHelper';
import validate from '../../middleware/validator/users';
import OauthController from '../../controllers/OauthController';

const { User } = models;
const router = Router();


router.get('/user', (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.put('/user', (req, res, next) => {
  User.findById(req.payload.id)
    .then((foundUser) => {
      if (!foundUser) {
        return res.sendStatus(401);
      }
      const user = foundUser;
      const {
        username, email, bio, image, password,
      } = req.body.user;

      // only update fields that were actually passed..
      if (!username) {
        user.username = username;
      }
      if (!email) {
        user.email = email;
      }
      if (!bio) {
        user.bio = bio;
      }
      if (!image) {
        user.image = image;
      }
      if (!password) {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(() => res.json({ user: user.toAuthJSON() }));
    })
    .catch(next);
});

router.post('/users/login', (req, res, next) => {
  if (!req.body.user) {
    return res.status(422).json({ errors: { user: 'must be an object' } });
  }

  if (!req.body.user.username) {
    return res.status(422).json({ errors: { username: 'can\'t be blank' } });
  }
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: 'can\'t be blank' } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: 'can\'t be blank' } });
  }
  return passport.authenticate(
    'local', { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (user) {
        const payload = {
          username: user.username,
          email: user.email,
        };

        const token = tokenService.generateToken(payload, '3d');
        return res.status(200).json({
          user: {
            email: user.email,
            username: user.username,
            token,
          },
        });
      }
      return res.status(422)
        .json(info);
    },
  )(req, res, next);
});

router.post('/users', validate, (req, res, next) => {
  const {
    username, email, password: hash,
  } = req.body.user;
  User.create({ username, email, hash })
  // return the user and a promise call to send the verification email
    .then(user => (
      { sendMail: verificationHelper.sendVerificationEmail(user), user }))
    .then(({ user }) => {
      const payload = {
        id: user.id,
        email: user.email,
        oauth: false,
      };
      const token = tokenService.generateToken(payload, '3d');

      res.status(201).json({
        user: {
          email: user.email,
          username: user.username,
          token,
        },
        message: 'Sign up successful, visit your email to verify your account.',
      });
    })
    .catch(next);
});

router.get('/users/verify/:token', (req, res, next) => {
  const { token } = req.params;
  const decoded = tokenService.verifyToken(token, process.env.AUTH_SECRET);
  if (!decoded) {
    return res.status(400)
      .json({ errors: { message: 'The link has expired' } });
  }
  User.findById(decoded.id)
    .then((user) => {
      const validateUser = verificationHelper.validateUser(user);
      if (!validateUser.status) {
        return res.status(validateUser.statusCode).json(validateUser.error);
      }
      const verifyUser = user;
      verifyUser.verified = true;
      verifyUser.save();
      return res.status(200)
        .json({ status: 'success', message: 'Your account has been verified' });
    })
    .catch(next);
  return null;
});

router.post('/users/verify/resend-email', (req, res, next) => {
  let { email } = req.body;
  email = email ? email.trim() : undefined;
  const validateEmail = verificationHelper.validateEmail(email);
  if (!validateEmail.status) {
    return res.status(validateEmail.statusCode).json(validateEmail.error);
  }
  User.findOne({ where: { email } })
    .then((user) => {
      const validateUser = verificationHelper.validateUser(user);
      if (validateUser.status) {
        // return a promise call to send verification email if validation passes
        return verificationHelper.sendVerificationEmail(user);
      }
      // generate and throw an error if user validation fails
      const error = new Error(validateUser.error.errors.message);
      error.status = validateUser.statusCode;
      throw error;
    })
    .then(() => res.status(200)
      .json({ message: 'Your verification link has been resent' }))
    .catch(next);
  return null;
});


router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/auth/linkedin',
  passport.authenticate('linkedin'),
);

router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
);

router.get(
  '/auth/google/redirect',
  passport.authenticate('google'),
  OauthController.handleRedirect,
);

router.get(
  '/auth/linkedin/redirect',
  passport.authenticate('linkedin'),
  OauthController.handleRedirect,
);

router.get(
  '/auth/facebook/redirect',
  passport.authenticate('facebook', { scope: ['email'] }),
  OauthController.handleRedirect,
);


export default router;
