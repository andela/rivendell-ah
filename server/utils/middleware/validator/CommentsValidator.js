import validator from '../../helpers/validatorHelper';
import errorHelper from '../../helpers/errorHelper';

/**
 * Validation middleware for comments route
 */
class CommentsValidator {
  /**
   * Function validates input on comment creation
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {undefined}
   */
  static createComment(req, res, next) {
    if (!req.body.comment) {
      errorHelper.throwError('Comment body is required', 400);
    }
    const { body: commentBody } = req.body.comment;
    const validation = validator.createCommentRules({ commentBody });
    if (validation) {
      return res.status(400).json({
        errors: validation,
      });
    }
    return next();
  }

  /**
   * Function validates input on comment update
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {undefined}
   */
  static updateComment(req, res, next) {
    if (!req.body.comment) {
      errorHelper.throwError('No update provided', 400);
    }
    const { body: commentBody } = req.body.comment;
    // Validation of comment update Inputs
    const validation = validator.updateCommentRules({
      commentBody,
    });
    if (validation) {
      return res.status(400).json({
        errors: validation,
      });
    }
    return next();
  }
}

export default CommentsValidator;
