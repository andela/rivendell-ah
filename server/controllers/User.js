import passport from 'passport';
import models from '../database/models';
import tokenService from '../utils/services/tokenService';
import verificationHelper from '../utils/helpers/verificationHelper';
import emailService from '../utils/services/emailService';
import hashPassowrd from '../utils/services/passwordHashService';
import emailTemplates from '../utils/services/emailTemplates';

const { User } = models;

/**
 *
 * The UserController contains static methods that are used as
 * controllers to handle the different user routes.
 *  @class UserController
 *  @returns {undefined} this is a class thus does not return anything
 */
class UserController {
  /**
   * Method adds a new user information to the database
   * with a json response of the user consisting of
   * properties email, username and token, if successful.
   * It handles the POST /api/users endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static signup(req, res, next) {
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

        return res.status(201).json({
          user: {
            email: user.email,
            username: user.username,
            token,
          },
          message: 'Sign up successful, visit your email'
          + ' to verify your account.',
        });
      })
      .catch(next);
  }

  /**
   * Method login an existing user that provides email and password,
   * and returns the user consisting of
   * properties email, username and token, if successful.
   * It handles the POST /api/users/login endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static login(req, res, next) {
    if (!req.body.user) {
      return res.status(422)
        .json({ errors: { user: 'must be an object' } });
    }

    if (!req.body.user.email) {
      return res.status(422)
        .json({ errors: { email: 'can\'t be blank' } });
    }

    if (!req.body.user.password) {
      return res.status(422)
        .json({ errors: { password: 'can\'t be blank' } });
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
  }

  /**
   * Method finds a single user by its id, and
   * returns the user, if successful.
   * It handles the GET /api/user endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static get(req, res, next) {
    User.findById(req.payload.id)
      .then((user) => {
        if (!user) {
          return res.sendStatus(401);
        }
        return res.json({ user: user.toAuthJSON() });
      })
      .catch(next);
  }

  /**
   * Method updates an existing user information in the database.
   * It handles the PUT /api/user endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static update(req, res, next) {
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
  }

  /**
   * Method verifies a user with a token.
   * It handles the GET /api/users/verify/:token' endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static verify(req, res, next) {
    const { token } = req.params;
    const decoded = tokenService.verifyToken(token, process.env.AUTH_SECRET);
    if (!decoded) {
      return res.status(400)
        .json({ errors: { message: 'The link has expired' } });
    }
    return User.findById(decoded.id)
      .then((user) => {
        const validateUser = verificationHelper.validateUser(user);
        if (!validateUser.status) {
          return res.status(validateUser.statusCode).json(validateUser.error);
        }
        const verifyUser = user;
        verifyUser.verified = true;
        verifyUser.save();
        return res.status(200)
          .json({
            status: 'success',
            message: 'Your account has been verified',
          });
      })
      .catch(next);
  }

  /**
   * Method resends an email to a user.
   * It handles the POST /api/users/verify/resend-email endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static resendEmail(req, res, next) {
    let { email } = req.body;
    email = email ? email.trim() : undefined;
    const validateEmail = verificationHelper.validateEmail(email);
    if (!validateEmail.status) {
      return res.status(validateEmail.statusCode).json(validateEmail.error);
    }
    return User.findOne({ where: { email } })
      .then((user) => {
        const validateUser = verificationHelper.validateUser(user);
        if (validateUser.status) {
          // return a promise call to send verification
          // email if validation passes
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
  }

  /**
   * Method sends a reset password link to a user email.
   * It handles the POST /api/users/forgot-password endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static forgotPassword(req, res, next) {
    const { email } = req.body.user;
    return User.findOne({
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
  }

  /**
   * Method verifies a user with a token from reset password url.
   * It handles the GET /api/users/reset-password endpoint.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @returns {Object} the response body
   */
  static resetPassword(req, res) {
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
  }

  /**
   * Method updates a user password in the database.
   * It handles the PUT /api/users/reset-password endpoint
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static resetPasswordUpdate(req, res, next) {
    const { resetToken, password } = req;
    return User.findOne({ where: { id: resetToken.id } })
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
  }
}

export default UserController;
