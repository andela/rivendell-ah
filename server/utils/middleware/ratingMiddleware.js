/**
 * @object
 */
const ratingMiddleware = {
  /**
   * @param {*} req the request body
   * @param {*} res the res body
   * @param {*} next a call to the next middle function
   */
  validateRating(req, res, next) {
    if (
      !(parseInt(req.body.rating, 10))
      || (parseInt(req.body.rating, 10) < 1)
      || (parseInt(req.body.rating, 10) > 5)) {
      return res.status(403).json({
        errors: {
          message: 'Invalid rating value',
        },
      });
    }

    return next();
  },
};

export default ratingMiddleware;
