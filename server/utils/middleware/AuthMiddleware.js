import tokenService from '../services/tokenService';

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
    if (decoded) {
      req.body.decoded = decoded;
      return next();
    }
    return res.status(401)
      .json({ errors: { message: 'Authentication failed' } });
  }
}

export default AuthMiddleware;
