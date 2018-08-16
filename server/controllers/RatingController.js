import models from '../database/models';
import ratingServices from '../utils/services/ratingServices';

const { Article, Rating } = models;

/**
 * @class rRatingController
 * @returns {undefined} no return values
 */
class RatingController {
  /**
   * post the rating of the article
   * with slug given in req.params
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param { Function } next error handling middleware
   * @returns {Object} res.body contain the info of the rating
   * res.body is object with properties ratingDetail and result
   */
  static rateArticle(req, res, next) {
    let { rating } = req.body;
    let userId = req.body.decoded.id;
    const { slug } = req.params;
    rating = parseInt(rating, 10);
    userId = parseInt(userId, 10);
    return Article
      .find({
        where: {
          slug,
        },
        include: [{ model: Rating, as: 'ratings' }],
      })
      .then((article) => {
        if (article) {
          if (article.authorId === userId) {
            return res.status(403).json({
              status: 'fail',
              message: 'You can\'t provide ratings for your article',
            });
          }
          return Rating
            .findOrCreate({
              where: {
                articleId: article.id,
                userId,
              },
              defaults: { rating },
            })
            .spread((rateData, rated) => {
              if (rated) {
                article.ratings.push(rateData);
                // call function to compute the average of rating
                const ratingInfo = ratingServices
                  .computeRating(article.ratings);

                // add property to ratingInfo object
                ratingInfo.ratingDetail.articleId = article.id;
                ratingInfo.ratingDetail.authorId = article.authorId;
                ratingInfo.rating = rateData;
                return res.status(201).json(ratingInfo);
              }
              return res.status(403).json({
                status: 'fail',
                message: 'Your rating have already been recoded',
              });
            });
        }
        return res.status(404).json({
          status: 'fail',
          message: 'Article not found',
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
   * res.body is object with properties ratingDetail and result
   */
  static updateRating(req, res, next) {
    let { rating } = req.body;
    let userId = req.body.decoded.id;
    const { slug } = req.params;
    rating = parseInt(rating, 10);
    userId = parseInt(userId, 10);
    return Article
      .find({
        where: {
          slug,
        },
        include: [{ model: Rating, as: 'ratings' }],
      })
      .then((article) => {
        if (article) {
          if (article.authorId === userId) {
            return res.status(403).json({
              status: 'fail',
              message: 'You can\'t provide ratings for your article',
            });
          }
          if (article.ratings) {
            let updatedRating;
            article.ratings.forEach((ratingToUpdate) => {
              if (ratingToUpdate.userId === userId) {
                updatedRating = ratingToUpdate;
                ratingToUpdate
                  .update({
                    rating: rating || ratingToUpdate.rating,
                  });
              }
            });
            // call function to compute the average of rating
            const ratingInfo = ratingServices.computeRating(article.ratings);

            // add property to ratingInfo object
            ratingInfo.ratingDetail.articleId = article.id;
            ratingInfo.ratingDetail.authorId = article.authorId;
            ratingInfo.rating = updatedRating;
            return res.status(200).json(ratingInfo);
          }
        }
        return res.status(404).json({
          status: 'fail',
          message: 'Article not found',
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
   * res.body is object with properties ratingDetail and ratings
   * req.body.ratings is an array containing the
   * details of each rating
   */
  static getArticleRating(req, res, next) {
    const { slug } = req.params;
    return Article
      .find({
        include: [{ model: Rating, as: 'ratings' }],
        where: {
          slug,
        },
      })
      .then((article) => {
        if (article) {
          // call function to compute the average of rating
          const ratingInfo = ratingServices.computeRating(article.ratings);

          // add property to ratingInfo object
          ratingInfo.ratingDetail.articleId = article.id;
          ratingInfo.ratingDetail.authorId = article.authorId;
          ratingInfo.rating = article.ratings;
          return res.status(200).json(ratingInfo);
        }
        return res.status(404).json({
          status: 'fail',
          message: 'Article not found',
        });
      })
      .catch(next);
  }
}

export default RatingController;
