import tokenService from '../services/tokenService';
import models from '../../database/models';

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
      return res.status(401)
        .json({ errors: { message: 'Authentication failed' } });
    }
    const { id } = decoded;
    return User.findById(id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .json({ errors: { message: 'User not found' } });
        }
        req.user = user;
        req.body.decoded = decoded;
        return next();
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
      return res.status(403)
        .json({
          errors: {
            message: 'Your account has not been verified',
          },
        });
    }
    req.body.decoded.verified = req.user.verified;
    return next();
  }
}

export default AuthMiddleware;
