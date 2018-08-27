import models from '../../../database/models';
import validator from '../../helpers/validatorHelper';
import tokenService from '../../services/tokenService';
import errorHelper from '../../helpers/errorHelper';

const { User } = models;

/**
 * Validation middleware for users route
 */
class UsersValidator {
  /**
  * Function validates user Sign up inputs with customized error messages
  * @param {Object} req the request body
  * @param {Object} res the response body
  * @param {function} next a call to the next function
  * @returns {undefined}
  */
  static signup(req, res, next) {
    if (!req.body.user) {
      errorHelper.throwError('Please provide the required fields', 400);
    }
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
        errors: validation,
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
            errorHelper
              .throwError('Email and Username entered already exists', 400);
          }
          if (user.email === userInput.email) {
            errorHelper
              .throwError('Email entered already exists', 400);
          }
          errorHelper
            .throwError('Username entered already exists', 400);
        }
        next();
      })
      .catch(next);
  }

  /**
    * Function validates user login inputs with customized error messages
    * @param {Object} req the request body
    * @param {Object} res the response body
    * @param {function} next a call to the next function
    * @returns {undefined}
    */
  static login(req, res, next) {
    if (!req.body.user) {
      errorHelper.throwError('Please provide the required fields', 400);
    }
    // User login inputs
    const userInput = {
      email: req.body.user.email,
      password: req.body.user.password,
    };
    // Validation of user Inputs
    const validation = validator.loginRules(userInput);
    if (validation) {
      return res.status(400).json({
        errors: validation,
      });
    }
    return next();
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
        errors: validation,
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
      errorHelper
        .throwError('Token can not be undefined', 400);
    }
    if (token === '') {
      errorHelper
        .throwError('Token can not be empty', 400);
    }
    const resetToken = tokenService.verifyToken(token, process.env.JWT_SECRET);
    if (!resetToken) {
      errorHelper
        .throwError('Invalid token', 401);
    }
    if (validation) {
      res.status(400).json({
        errors: validation,
      });
    }
    if (password !== confirm) {
      errorHelper
        .throwError('Password does not match', 409);
    }
    req.resetToken = resetToken;
    req.password = password;
    next();
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
      errorHelper
        .throwError('No update data provided', 400);
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
            errorHelper
              .throwError('Username provided is already taken', 400);
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
