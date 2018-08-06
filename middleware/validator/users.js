import models from '../../models';
import validator from '../../helpers/validatorHelper';

const { User } = models;
/**
 * Function validates user Signup inputs with customized error messages
 * @param {Object} req the request body
 * @param {Object} res the response body
 * @param {function} next a call to the nect function
 * @returns {undefined}
 */
export default function signup(req, res, next) {
  // User Signup inputs
  const userInput = {
    username: req.body.user.username,
    email: req.body.user.email,
    password: req.body.user.password,
  };
  // Validation of user Inputs
  const validation = validator(userInput);
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
}
