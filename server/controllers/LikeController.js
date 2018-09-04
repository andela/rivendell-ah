import db from '../database/models';
import helper from '../utils/helpers/likeControllerHelper';
import errorHelper from '../utils/helpers/errorHelper';
import notificationService from '../utils/services/notificationService';

const { Article, ArticleLike, User } = db;

const { notify } = notificationService;

/**
 * This class contains static methods for liking and unliking
 * articles in the applications. It also contains methods
 * for retrieving like informations for a particular article
 * @class LikeController
 * @returns {object} when called with the  new it returns an
 * instance of LikeController but this is never used
 */
class LikeController {
  /**
   * This function is a middleware and is called when the user wants
   * to like a particular article.
   * @param {object} req the request object containing the user's request
   * @param {object} res the response object used to send a respons to the user
   * @param {function} next called when an error occurs
   * @returns {void} does not return a value
   */
  static likeArticle(req, res, next) {
    const { slug } = req.params;
    const { decoded: user } = req.body;
    Article.findOne({
      where: { slug },
      attributes: ['id', 'title', 'slug', 'authorId'],
      include: {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'image'],
      },
    }).then((article) => {
      if (!article) {
        errorHelper
          .throwError('Article with that slug was not found', 404);
      }
      const likeObj = { userId: user.id, articleId: article.id };
      return ArticleLike.findOrCreate({
        where: likeObj,
        defaults: likeObj,
        attributes: [['updatedAt', 'timeLiked']],
      }).then(([, created]) => {
        if (created) {
          // initialize notification params
          const { authorId } = article;
          // notify users of interest
          notify(article.id, 'likes', user.id, authorId, article.id, null);
          return res.status(201).json({
            data: article.dataValues,
          });
        }
        return res.status(200).json({
          data: article.dataValues,
          message: 'You had already liked this article',
        });
      });
    }).catch(next);
  }

  /**
   * This unlikes an article specified in the request.
   * @param {object} req an object containing the request made to the server
   * @param {object} res this object is used to send a response to the user
   * @param {Function} next  called when an error occurs
   * @returns {void} does not return a value
   */
  static unlikeArticle(req, res, next) {
    const { slug } = req.params;
    const { decoded: user } = req.body;
    Article.findOne({ where: { slug } })
      .then((article) => {
        if (!article) {
          errorHelper
            .throwError('The Article you specified does not exist', 404);
        }
        return ArticleLike.destroy({
          where: { userId: user.id, articleId: article.id },
        });
      }).then((deleted) => {
        if (!deleted) {
          errorHelper
            .throwError('You had not previously liked the article', 400);
        }
        return res.sendStatus(204);
      }).catch(next);
  }


  /**
   *
   * This method retrieves information of all the
   * likes of a particular article from the database.
   * It uses the extractId function from the likeHelper.
   * @param {object} req contians the request informations
   * sent to the server
   * @param {object} res used to send a response back to the
   * client
   * @param {object} next called when an error occurs while
   * querying the database
   * @returns {void} does not return a value to the user
   */
  static getArticleLikes(req, res, next) {
    const { slug } = req.params;
    let { limit } = req.query;
    const { page } = req.query;
    const articleId = helper.extractId(slug);
    limit = limit < 50 && limit > 0 ? limit : 50;
    const offset = page > 0 ? ((page - 1) * limit) : 0;
    ArticleLike.findAndCountAll({
      where: { articleId },
      include: [{
        model: User,
        as: 'user',
        attributes: [
          'firstName', 'lastName',
          'bio', 'image', 'id',
        ],
      }],
      attributes: [['updatedAt', 'timeLiked']],
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    }).then((returnedObj) => {
      const { rows, count } = returnedObj;
      if (!count) {
        return res.status(204).send();
      }
      return res.status(200).json({
        data: rows,
        totalLikes: count,
      });
    }).catch(next);
  }
}

export default LikeController;
