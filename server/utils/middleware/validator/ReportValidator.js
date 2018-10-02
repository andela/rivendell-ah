import validator from '../../helpers/validatorHelper';
import errorHelper from '../../helpers/errorHelper';


/**
 * Validation middleware for comments route
 */
class ReportValidator {
  /**
     * Function validates input on comment creation
     * @param {Object} req the request body
     * @param {Object} res the response body
     * @param {function} next a call to the next function
     * @returns {undefined}
     */
  static createReport(req, res, next) {
    const { report } = req.body;
    if (!report) {
      errorHelper.throwError('report object is required', 400);
    }
    const validationErrors = validator.createReportArticleRules(report);
    if (validationErrors) {
      return res.status(400)
        .json({
          errors: validationErrors,
        });
    }
    return next();
  }
}

export default ReportValidator;
