import sequelize from 'sequelize';
import models from '../database/models';

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
    let userId = req.body.decoded.id;
    const { slug } = req.params;
    rating = parseInt(rating, 10);
    userId = parseInt(userId, 10);
    return Article
      .find({ where: { slug } })
      .then((article) => {
        if (!article) {
          return res.status(404).json({
            errors: { message: 'Article not found' },
          });
        }
        if (article.authorId === userId) {
          return res.status(403).json({
            errors: {
              message: 'You can\'t provide ratings for your article',
            },
          });
        }
        return Rating
          .findOrCreate({
            where: {
              userId,
              articleId: article.id,
            },
            defaults: { rating },
          })
          .spread((rateData, rated) => {
            if (rated) {
              return Rating.findOne({
                where: { articleId: article.id },
                attributes: [
                  [sequelize.fn('SUM', sequelize.col('rating')),
                    'totalRating'],
                  [sequelize.fn('COUNT', sequelize.col('rating')),
                    'ratingCount'],
                  [sequelize.fn('AVG', sequelize.col('rating')),
                    'averageRating'],
                ],
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
            }
            return res.status(403).json({
              errors: {
                message: 'Your rating have already been recoded',
              },
            });
          });
      })
      .catch(next);
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
    let userId = req.body.decoded.id;
    const { slug } = req.params;
    rating = parseInt(rating, 10);
    userId = parseInt(userId, 10);
    return Article
      .find({ where: { slug } })
      .then((article) => {
        if (!article) {
          return res.status(404).json({
            errors: { message: 'Article not found' },
          });
        }
        if (article.authorId === userId) {
          return res.status(403).json({
            errors: {
              message: 'You can\'t provide ratings for your article',
            },
          });
        }
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
          )
          .then(([updated, updatedRating]) => {
            if (updated) {
              return Rating.findOne({
                where: { articleId: article.id },
                attributes: [
                  [sequelize.fn('SUM', sequelize.col('rating')),
                    'totalRating'],
                  [sequelize.fn('COUNT', sequelize.col('rating')),
                    'ratingCount'],
                  [sequelize.fn('AVG', sequelize.col('rating')),
                    'averageRating'],
                ],
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
            }
            return res.status(404).json({
              errors: {
                message: 'Rating not found, no update was made',
              },
            });
          });
      })
      .catch(next);
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
      })
      .then((article) => {
        if (!article) {
          return res.status(404).json({
            errors: {
              message: 'Article not found',
            },
          });
        }
        return Rating.findOne({
          where: { articleId: article.id },
          attributes: [
            [sequelize.fn('SUM', sequelize.col('rating')),
              'totalRating'],
            [sequelize.fn('COUNT', sequelize.col('rating')),
              'ratingCount'],
            [sequelize.fn('AVG', sequelize.col('rating')),
              'averageRating'],
          ],
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
