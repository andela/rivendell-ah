import passport from 'passport';
import models from '../database/models';
import tokenService from '../utils/services/tokenService';
import verificationHelper from '../utils/helpers/verificationHelper';
import emailService from '../utils/services/emailService';
import hashPassword from '../utils/services/passwordHashService';
import emailTemplates from '../utils/services/emailTemplates';
import errorHelper from '../utils/helpers/errorHelper';
import userControllerHelper from '../utils/helpers/userControllerHelper';
import notificationService from '../utils/services/notificationService';

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
      firstName, lastName, email, password: hash,
    } = req.body.user;

    const username = req.body.user.username.toLowerCase();
    User.create({
      firstName, lastName, username, email, hash,
    }).then(user => (
      // return the user and a promise call to send the verification email
      { sendMail: verificationHelper.sendVerificationEmail(user), user }))
      .then(({ user }) => {
        const payload = {
          id: user.id,
          username: user.username,
          email: user.email,
        };
        const token = tokenService.generateToken(payload, '3d');
        res.status(201).json({
          user: userControllerHelper.userDetails(user, token),
          message: 'Sign up successful, visit your email '
            + 'to verify your account.',
        });
      }).catch(next);
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
    return passport.authenticate(
      'local', { session: false },
      (err, user) => {
        if (err) return next(err);

        if (user) {
          const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
          };
          const token = tokenService.generateToken(payload, '3d');
          return res.status(200).json({
            user: userControllerHelper.userDetails(user, token),
          });
        }
        return errorHelper
          .throwError('email and password combination not found', 400);
      },
    )(req, res, next);
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
    const foundUser = req.user;
    const {
      firstName, lastName, username, password, bio, image,
    } = req.body.user;
    const user = foundUser;
    // only update fields that were actually passed...
    user.username = username ? username.trim() : foundUser.username;
    user.firstName = firstName ? firstName.trim() : foundUser.firstName;
    user.lastName = lastName ? lastName.trim() : foundUser.lastName;
    user.bio = bio ? bio.trim() : foundUser.bio;
    user.image = image ? image.trim() : foundUser.image;
    user.hash = password
      ? hashPassword(password, user.salt) : foundUser.hash;
    return user.save()
      .then(() => res.status(200).json({
        user: userControllerHelper.userDetails(user),
      })).catch(next);
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
      errorHelper.throwError('The link has expired', 400);
    }
    return User.findById(decoded.id)
      .then((user) => {
        const validateUser = verificationHelper.validateUser(user);
        if (!validateUser.status) {
          errorHelper.throwError(validateUser.error, validateUser.statusCode);
        }
        const verifyUser = user;
        verifyUser.verified = true;
        verifyUser.save();
        return res.status(200)
          .json({ message: 'Your account has been verified' });
      }).catch(next);
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
      errorHelper
        .throwError(validateEmail.error, validateEmail.statusCode);
    }
    return User.findOne({ where: { email } })
      .then((user) => {
        const validateUser = verificationHelper.validateUser(user);
        if (!validateUser.status) {
          errorHelper.throwError(validateUser.error, validateUser.statusCode);
        }
        // return a promise call to send verification
        // email if validation passes
        return verificationHelper.sendVerificationEmail(user);
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
    }).then((user) => {
      if (!user) {
        errorHelper.throwError('User not found', 404);
      }
      const token = tokenService
        .generateToken({ id: user.id, username: user.username }, 1800);
      let url = `${process.env.BASEURL}`;
      url += `/api/users/reset-password?token=${token}`;
      const mailOptions = emailService.mailOptions(
        user.email,
        "Authors Heaven's account token",
        emailTemplates.resetPasswordTemplate(url, user),
      );
      return emailService.sendMail(mailOptions);
    }).then(() => res.status(200).json({
      message: 'Check your email for password reset token',
    })).catch(next);
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
      errorHelper.throwError('Invalid token', 401);
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
   * @return {Object} the response body
   */
  static resetPasswordUpdate(req, res, next) {
    const { resetToken, password } = req;
    return User.findOne({ where: { id: resetToken.id } })
      .then((user) => {
        if (user) {
          return user.update({ hash: hashPassword(password, user.salt) })
            .then(result => res.status(200)
              .json({
                username: result.username, message: 'Password updated!',
              }));
        }
        return errorHelper.throwError('User not found', 404);
      }).catch(next);
  }

  /**
   * Get a profile
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getProfile(req, res, next) {
    const { username } = req.params;
    User.findOne({ where: { username } })
      .then((user) => {
        if (!user) {
          errorHelper.throwError('User not found', 404);
        }
        notificationService.readNotification(req, next);
        return res.status(200)
          .json({
            profile: userControllerHelper.userDetails(user),
          });
      }).catch(next);
  }


  /**
   * get all users, with the ability to search for users/profiles
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getAllProfiles(req, res, next) {
    const { search } = req.query;
    let { limit } = req.query;
    const { page } = req.query;
    limit = limit <= 20 ? limit : 20;
    const offset = page > 0 ? ((page - 1) * limit) : 0;
    const dbQuery = {
      limit,
      offset,
      attributes: [
        'firstName', 'lastName', 'email',
        'image', 'bio', 'username',
      ],
    };
    if (search) {
      dbQuery.where = { username: { $like: `%${search}%` } };
    }
    User.findAll(dbQuery)
      .then(result => res.status(200).json(result))
      .catch(next);
  }
}

export default UserController;
