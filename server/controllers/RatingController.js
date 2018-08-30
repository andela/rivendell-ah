import sequelize from 'sequelize';
import models from '../database/models';
import errorHelper from '../utils/helpers/errorHelper';
import ratingControllerHelper from '../utils/helpers/ratingControllerHelper';

const { Article, Rating } = models;

/**
 * @class RatingController
 * @returns {undefined} no return values
 */
class RatingController {
  /**
   * post the rating of the article
   * with slug in req.params
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param { Function } next error handling middleware
   * @returns {Object} res.body contain the info of the rating
   * res.body is object with properties ratingDetails and rating
   */
  static rateArticle(req, res, next) {
    let { rating } = req.body;
    const userId = req.body.decoded.id;
    const { slug } = req.params;
    rating = parseInt(rating, 10);
    return Article
      .find({ where: { slug } })
      .then((article) => {
        ratingControllerHelper.validateRating(article, userId);
        return Rating
          .findOrCreate({
            where: { userId, articleId: article.id },
            defaults: { rating },
          }).spread((rateData, rated) => {
            if (!rated) {
              errorHelper
                .throwError('Your rating have already been recorded', 403);
            }
            return Rating.findOne({
              where: { articleId: article.id },
              attributes: ratingControllerHelper.ratingAttributes(sequelize),
            }).then((ratingStats) => {
              const ratingStatus = ratingStats.dataValues;
              // the plus + sign below is stringify the returned data
              ratingStatus.averageRating = +ratingStatus.averageRating;
              ratingStatus.averageRating = ratingStatus
                .averageRating.toPrecision(3);
              return res.status(201).json({
                ratingDetails: ratingStatus,
                rating: rateData,
              });
            });
          });
      }).catch(next);
  }

  /**
   * post the rating of the article
   * with slug given in req.params
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param { function } next call error handling middleware
   * @returns {Object} res.body
   * res.body is object with properties ratingDetails and rating
   */
  static updateRating(req, res, next) {
    let { rating } = req.body;
    const userId = req.body.decoded.id;
    const { slug } = req.params;
    rating = parseInt(rating, 10);
    return Article
      .find({ where: { slug } })
      .then((article) => {
        ratingControllerHelper.validateRating(article, userId);
        return Rating
          .update(
            { rating },
            {
              where: {
                userId,
                articleId: article.id,
              },
              returning: true,
            },
          ).then(([updated, updatedRating]) => {
            if (!updated) {
              errorHelper
                .throwError('Rating not found, no update was made', 404);
            }
            return Rating.findOne({
              where: { articleId: article.id },
              attributes: ratingControllerHelper.ratingAttributes(sequelize),
            }).then((ratingStats) => {
              const ratingStatus = ratingStats.dataValues;
              // the plus + sign below is stringify the returned data
              ratingStatus.averageRating = +ratingStatus.averageRating;
              ratingStatus.averageRating = ratingStatus
                .averageRating.toPrecision(3);
              return res.status(200).json({
                ratingDetails: ratingStatus,
                rating: updatedRating[0],
              });
            });
          });
      }).catch(next);
  }

  /**
   * get the rating information of the article
   * with slug given in req.params
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param { function } next call error handling middleware
   * @returns {Object} reqired in req.body
   * res.body is object with properties ratingDetails and ratings
   * req.body.ratings is an array containing the
   * details of each rating
   */
  static getArticleRating(req, res, next) {
    const { slug } = req.params;
    return Article
      .find({
        where: { slug },
        include: [{ model: Rating, as: 'ratings' }],
      }).then((article) => {
        if (!article) errorHelper.throwError('Article not found', 404);
        return Rating.findOne({
          where: { articleId: article.id },
          attributes: ratingControllerHelper.ratingAttributes(sequelize),
        }).then((ratingStats) => {
          const ratingStatus = ratingStats.dataValues;
          // the plus + sign below is stringify the returned data
          ratingStatus.averageRating = +ratingStatus.averageRating;
          ratingStatus.averageRating = ratingStatus
            .averageRating.toPrecision(3);
          return res.status(200).json({
            ratingDetails: ratingStatus,
            ratings: article.ratings,
          });
        });
      })
      .catch(next);
  }
}

export default RatingController;
