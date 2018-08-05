import jwt from 'jsonwebtoken';

const tokenService = {
  /**
   * Generate a token
   * @param {Object} payload - object to be encoded into a token
   * @param {Number} expiresIn - time for token to expire
   * @returns {String} token
   */
  generateToken(payload, expiresIn) {
    return jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn });
  },
  /**
   * Verify token
   * @param {String} token - token
   * @returns {null} null
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.AUTH_SECRET);
    } catch (err) {
      return false;
    }
  },
};


export default tokenService;
