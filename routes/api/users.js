import passport from 'passport';
import { Router } from 'express';
import models from '../../models';
import tokenService from '../../services/tokenService';
import verificationHelper from '../../helpers/verificationHelper';
import validate from '../../middleware/validator/users';
import emailService from '../../services/emailService';
import hashPassowrd from '../../services/passwordHashService';
import emailTemplates from '../../services/emailTemplates';

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
          id: user.id,
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

router.post('/users', validate.signup, (req, res, next) => {
  const {
    username, email, password: hash,
  } = req.body.user;
  User.create({ username, email, hash })
    // return the user and a promise call to send the verification email
    .then(user => (
      { sendMail: verificationHelper.sendVerificationEmail(user), user }))
    .then(({ user }) => {
      const payload = {
        username: user.username,
        email: user.email,
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

router.post(
  '/users/forgot-password',
  validate.forgotPassword, (req, res, next) => {
    const { email } = req.body.user;
    User.findOne({
      where: { email },
    })
      .then((user) => {
        if (!user) {
          return res.status(404)
            .json({ errors: { message: 'User not found!' } });
        }
        const token = tokenService
          .generateToken({ id: user.id, username: user.username }, 60 * 30);
        let url = `${process.env.BASEURL}`;
        url += `/api/users/reset-password?token=${token}`;
        const mailOptions = emailService.mailOptions(
          user.email,
          "Authors Heaven's account token",
          emailTemplates.resetPasswordTemplate(url, user),
        );
        emailService.sendMail(mailOptions)
          .then(() => res.status(200).json({
            message: 'Check your email for password reset token',
          }))
          .catch(next);
        return null;
      })
      .catch(next);
    return null;
  },
);

router.get('/users/reset-password', (req, res) => {
  const { token } = req.query;
  const decoded = tokenService.verifyToken(token);

  if (!decoded) {
    return res.status(401)
      .json({ errors: { message: 'Invalid token' } });
  }

  return res.status(200)
    .json({
      message: 'Verification Successful, You can now reset your password',
    });
});

router.put(
  '/users/reset-password',
  validate.resetPassowrd, (req, res, next) => {
    const { resetToken, password } = req;

    User.findOne({ where: { id: resetToken.id } })
      .then((user) => {
        if (user) {
          user.update({ hash: hashPassowrd(password, user.salt) })
            .then(result => res.status(200)
              .json({
                username: result.username, message: 'Password updated!',
              }));
        } else {
          return res.status(400)
            .json({ errors: { message: 'User not found' } });
        }
        return null;
      })
      .catch(next);
    return null;
  },
);

export default router;
