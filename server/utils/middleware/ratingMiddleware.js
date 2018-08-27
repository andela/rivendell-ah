import errorHelper from '../helpers/errorHelper';

/**
 * @object
 */
const ratingMiddleware = {
  /**
   * @param {Object} req the request body
   * @param {Object} res the res body
   * @param {Function} next a call to the next middle function
   * @returns {Function} returns next
   */
  validateRating(req, res, next) {
    if (
      !(parseInt(req.body.rating, 10))
      || (parseInt(req.body.rating, 10) < 1)
      || (parseInt(req.body.rating, 10) > 5)) {
      errorHelper.throwError('Invalid rating value', 403);
    }
    return next();
  },
};

export default ratingMiddleware;
