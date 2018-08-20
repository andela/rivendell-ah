import tokenService from '../services/tokenService';
import models from '../../database/models';
import errorHelper from '../helpers/errorHelper';

const { User } = models;

/**
* Authentication middleware
*/
class AuthMiddleware {
  /**
  * Authenticate user
  * @param {Object} req request object
  * @param {Object} res response object
  * @param {Function} next a call to the next function
  * @returns {Object} a function on success and an error object on failure
  */
  static authenticateUser(req, res, next) {
    const token = req.headers.authorization;
    let decoded;
    if (token) decoded = tokenService.verifyToken(token);
    if (!decoded) {
      errorHelper
        .throwError('Authentication failed', 401);
    }
    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          errorHelper
            .throwError('User not found', 404);
        }
        req.user = user;
        req.body.decoded = decoded;
        next();
      })
      .catch(next);
  }

  /**
   * Verify user
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next a call to the next function
   * @returns {Object} a function on success and an error object on failure
   */
  static verifyUser(req, res, next) {
    if (!req.user.verified) {
      errorHelper
        .throwError('Your account has not been verified', 403);
    }
    next();
  }
}
export default AuthMiddleware;
