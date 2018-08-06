import models from '../../../database/models';
import validator from '../../helpers/validatorHelper';
import tokenService from '../../services/tokenService';

const { User } = models;

/**
 * Validation middleware for users route
 */
class UsersValidator {/**
  * Function validates user Sign up inputs with customized error messages
  * @param {Object} req the request body
  * @param {Object} res the response body
  * @param {function} next a call to the next function
  * @returns {undefined}
  */
  static signup(req, res, next) {
    // User Signup inputs
    const userInput = {
      username: req.body.user.username,
      email: req.body.user.email,
      password: req.body.user.password,
      firstName: req.body.user.firstName,
      lastName: req.body.user.lastName,
    };
    // Validation of user Inputs
    const validation = validator.signupRules(userInput);
    if (validation) {
      return res.status(400).json({
        status: 'fail',
        error: validation,
      });
    }
    // Checking if email already exists in DB
    return User.find({
      where: {
        $or: [
          { username: req.body.user.username },
          { email: req.body.user.email },
        ],
      },
    })
      .then((user) => {
        if (user) {
          if (user.email === userInput.email
            && user.username === userInput.username) {
            return res.status(400).json({
              status: 'fail',
              error: 'Email and Username entered already exists',
            });
          }
          if (user.email === userInput.email) {
            return res.status(400).json({
              status: 'fail',
              error: 'Email entered already exists',
            });
          }
          return res.status(400).json({
            status: 'fail',
            error: 'Username entered already exists',
          });
        }
        return next();
      })
      .catch(next);
  }

  /**
  * Function validates forgot password with error messages
  * @param {Object} req the request body
  * @param {Object} res the response body
  * @param {function} next a call to the nect function
  * @returns {undefined}
  */
  static forgotPassword(req, res, next) {
    const { email } = req.body.user;
    // Validation of user Inputs
    const validation = validator.forgotPasswordRules({ email });
    if (validation) {
      return res.status(400).json({
        status: 'fail',
        error: validation,
      });
    }
    return next();
  }

  /**
   * Function validates reset password with error messages
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the nect function
   * @returns {undefined}
   */
  static resetPassword(req, res, next) {
    const token = req.headers.authorization;
    const { password, confirm } = req.body.user;
    const validation = validator.resetPasswordRules({ password });

    if (token === undefined) {
      return res.status(400)
        .json({ errors: { message: 'Token can not be undefined' } });
    }
    if (token === '') {
      return res.status(400)
        .json({ errors: { message: 'Token can not be empty' } });
    }
    const resetToken = tokenService.verifyToken(token, process.env.JWT_SECRET);

    if (!resetToken) {
      return res.status(401)
        .json({ errors: { message: 'Invalid token' } });
    }
    if (validation) {
      return res.status(400).json({
        status: 'fail',
        error: validation,
      });
    }
    if (password !== confirm) {
      return res.status(409)
        .json({ errors: { message: 'Password does not match' } });
    }
    req.resetToken = resetToken;
    req.password = password;
    return next();
  }

  /**
   * Function validates user update inputs with customized error messages
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {undefined}
   */
  static updateUser(req, res, next) {
    const { decoded } = req.body;
    if (!req.body.user) {
      return res.status(400)
        .json({ errors: { message: 'No update data provided' } });
    }
    let {
      firstName, lastName, password, username,
    } = req.body.user;
    firstName = firstName ? firstName.trim() : undefined;
    lastName = lastName ? lastName.trim() : undefined;
    password = password ? password.trim() : undefined;
    username = username ? username.trim() : undefined;
    // Validation of user update Inputs
    const validation = validator.updateUserRules({
      firstName, lastName, password, username,
    });
    if (validation) {
      return res.status(400).json({
        errors: validation,
      });
    }
    return User.findOne({
      where: { username },
    })
      .then((user) => {
        if (user) {
          // make sure provided user name is not already taken
          if (user.username === username
            && user.email !== decoded.email) {
            return res.status(400)
              .json({
                errors: {
                  message: 'Username provided is already taken',
                },
              });
          }
        }
        // update the req body with validated input
        req.body.user = Object.assign(req.body.user, {
          firstName, lastName, username, password,
        });
        return next();
      })
      .catch(next);
  }
}

export default UsersValidator;
