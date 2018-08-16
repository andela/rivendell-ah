/**
 * @class 
 */
const ratingMiddleware = {
  /**
   * @param {*} req the request body
   * @param {*} res the res body
   * @param {*} next a call to the next middle function
   */
  validateRating(req, res, next) {
    const numberFormat = /^\d*[1-9]\d*$/;
    if (
      (numberFormat.test(req.params.slug))
      || (req.params.slug.trim().length < 15)) {
      return res.status(404).json({ message: 'Invalid request' });
    }

    if (
      !(parseInt(req.body.rating, 10))
      || (parseInt(req.body.rating, 10) < 1)
      || (parseInt(req.body.rating, 10) > 5)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid rating value',
      });
    }

    return next();
  },
};

export default ratingMiddleware;
