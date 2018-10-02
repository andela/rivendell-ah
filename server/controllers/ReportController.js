
import { Report, Article } from '../database/models'; //eslint-disable-line
import errorHelper from '../utils/helpers/errorHelper';


/**
 *this class contains static methods used to handle
 * reporting of articles in the app.
 * @class ReportController
 * @returns {object} when called with the  new it returns an
 * instance of ReportController but this is never used
 */
class ReportController {
  /**
   * This middleware function is handles requests made to the
   * POST /api/articles/:slug/report
   * @param {object} req this contains the user's request
   * @param {object} res this is used to send a reponse to
   * the user
   * @param {Function} next calls the next middleware
   * in the chain
   * @returns {void} performs an action and returns nothing
   */
  static reportArticle(req, res, next) {
    const { type, description } = req.body.report;
    const { slug } = req.params;
    Article.findOne({ where: { slug } })
      .then((article) => {
        if (article) {
          return article.createReport({ type, description })
            .then((report) => {
              res.status(201)
                .json({
                  report,
                });
            });
        }

        return errorHelper
          .throwError('The article with that'
          + ' slug was not found', 404);
      }).catch(next);
  }
}

export default ReportController;
