import models from '../../../database/models';
import validator from '../../helpers/validatorHelper';
import tokenService from '../../services/tokenService';

const { User } = models;
/**
 * Function validates user Signup inputs with customized error messages
 * @param {Object} req the request body
 * @param {Object} res the response body
 * @param {function} next a call to the nect function
 * @returns {undefined}
 */
const signup = (req, res, next) => {
  // User Signup inputs
  const userInput = {
    username: req.body.user.username,
    email: req.body.user.email,
    password: req.body.user.password,
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
      $or: [{ username: req.body.user.username },
        { email: req.body.user.email }],
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
};

/**
* Function validates forgot password with error messages
* @param {Object} req the request body
* @param {Object} res the response body
* @param {function} next a call to the nect function
* @returns {undefined}
*/
const forgotPassword = (req, res, next) => {
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
};

/**
 * Function validates reset password with error messages
 * @param {Object} req the request body
 * @param {Object} res the response body
 * @param {function} next a call to the nect function
 * @returns {undefined}
 */
const resetPassowrd = (req, res, next) => {
  const token = req.headers.authorization;
  const { password, confirm } = req.body.user;
  const validation = validator.resetPassowrdRules({ password });

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
};

export default {
  signup,
  forgotPassword,
  resetPassowrd,
};
