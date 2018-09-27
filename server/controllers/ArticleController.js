import slugCreate from 'slug';
import uuid from 'uuid/v1';
import Sequelize from 'sequelize';
import models from '../database/models';
import articleControllerHelper from '../utils/helpers/articleControllerHelper';
import errorHelper from '../utils/helpers/errorHelper';
import setPaginationParameters
  from '../utils/helpers/setPaginationParametersHelper';
import notificationService from '../utils/services/notificationService';

const {
  Article, User, Tag, Subcategory, Follow, ArticleLike,
} = models;

const { notify } = notificationService;

/**
 *
 * The ArticleController contains static methods that are used as
 * controllers to handle the different article routes.
 *  @class ArticleController
 *  @returns {undefined} this is a class thus does not return anything
 */
class ArticleController {
  /**
   * Method adds a new article to the database
   * It returns a json response of the article created
   * It handles the POST /api/articles.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static createArticle(req, res, next) {
    const {
      title, description, body, tags, image,
    } = req.body.article;
    // generating a slug
    const id = uuid();
    const slug = slugCreate(`${title.toLowerCase()}-${id}`);
    const authorId = req.body.decoded.id;
    const subcategoryId = req.body.subcategoryDetails
      ? req.body.subcategoryDetails.id : 1;
    const subcategoryName = req.body.subcategoryDetails
      ? req.body.subcategoryDetails.name : 'OTHERS';
    const {
      username, bio,
    } = req.user;
    const newArticle = {
      id, slug, title, description, body, authorId, subcategoryId, image,
    };
    Article.create(newArticle)
      .then((article) => {
        // initialize notification params
        const type = 'create article';
        // notify users of interest
        notify(article.id, type, authorId, authorId, article.id, null);
        articleControllerHelper.createAndFindTags(tags)
          .then((tagInstances) => {
            article.addTags(tagInstances)
              .then(() => {
                const articleResponse = articleControllerHelper
                  .createArticleResponse(
                    article, subcategoryId, subcategoryName,
                    username, bio, image,
                  );
                articleResponse.tags = articleControllerHelper
                  .formatTagResponse(tagInstances);
                res.status(201).json({ article: articleResponse });
              });
          });
      }).catch(next);
  }

  /**
   * Method gets an article from the database,
   * It returns a json response of the article retrieved
   * It handles the GET /api/articles/:slug.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getArticle(req, res, next) {
    Article.find({
      where: { slug: req.params.slug },
      include: [
        articleControllerHelper.includeAuthor(User),
        articleControllerHelper.includeTag(Tag),
        articleControllerHelper.includeSubcategory(Subcategory),
        articleControllerHelper.includeArticleLike(ArticleLike),
      ],
      attributes: articleControllerHelper
        .articleAttributes(),
    }).then((article) => {
      if (!article) {
        errorHelper.throwError('Article not found', 404);
      }
      const articleObj = article.dataValues;
      articleObj.tags = articleControllerHelper
        .formatTagResponse(article.tags);
      articleObj.likesCount = articleObj.likes.length;
      notificationService.readNotification(req, next);
      return res.status(200).json({
        article: articleObj,
      });
    }).catch(next);
  }

  /**
   * Method gets all articles from the database,
   * It returns a json response of the articles retrieved
   * It handles the GET /api/articles.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getAllArticle(req, res, next) {
    const paginationParams = setPaginationParameters(req);
    Article.findAndCountAll({
      distinct: 'id',
      limit: paginationParams.limit,
      offset: paginationParams.offset,
      order: [['createdAt', 'DESC']],
      where: req.filterByArticleAttributes,
      include: [
        articleControllerHelper
          .includeAuthor(User, req.filterByAuthorAttributes),
        articleControllerHelper
          .includeTag(Tag, req.filterByTag),
        articleControllerHelper
          .includeSubcategory(Subcategory, req.filterBySubcategoryAttributes),
        articleControllerHelper.includeArticleLike(ArticleLike),
      ],
      attributes: articleControllerHelper
        .articleAttributes(true),
    }).then((articles) => {
      const finalArticleResponseObj = articles
        .rows.map(({ dataValues }) => {
          const articleObj = dataValues;
          articleObj.tags = articleControllerHelper
            .formatTagResponse(articleObj.tags);
          articleObj.likesCount = articleObj.likes.length;
          return articleObj;
        });
      return res.status(200).json({
        articles: finalArticleResponseObj,
        articlesCount: articles.count,
      });
    })
      .catch(next);
  }

  /**
   * Method updates an article in the database,
   * It returns a json response of the article updated
   * It handles the PUT /api/articles/:slug
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static updateArticle(req, res, next) {
    const { title = '', description = '', body = '' } = req.body.article;
    const authorId = req.body.decoded.id;
    const updateField = [];
    const subcategoryId = req.body.subcategoryDetails
      ? req.body.subcategoryDetails.id : null;

    if (title.trim()) updateField.push('title');
    if (description.trim()) updateField.push('description');
    if (body.trim()) updateField.push('body');
    if (subcategoryId) updateField.push('subcategoryId');

    Article.update(
      {
        title, description, body, subcategoryId,
      },
      {
        where: { slug: req.params.slug, authorId },
        returning: true,
        fields: updateField,
      },
    ).then(([updated, article]) => {
      if (!updated) {
        errorHelper.throwError('Article not found. Cannot Update', 404);
      }
      return res.status(200).json({
        article: article[0],
      });
    }).catch(next);
  }

  /**
   * Method deletes an article from the database,
   * It returns a json response of the article deleted
   * It handles the DELETE /api/articles/:slug.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static deleteArticle(req, res, next) {
    const authorId = req.body.decoded.id;
    Article.destroy({ where: { slug: req.params.slug, authorId } })
      .then((success) => {
        if (!success) {
          errorHelper.throwError('Article not found', 404);
        }
        return res.status(200).json();
      }).catch(next);
  }

  /**
   * this controller handle request for user to get
   * users feed
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {Object} next call the next middle
   * @returns {Array} an array of articles for users
   * the user is following order by the latest
   * article that was created
   */
  static getUserFeed(req, res, next) {
    let { limit } = req.query;
    const { id: userId } = req.user;
    limit = parseInt(limit, 10);
    Follow
      .findAll({
        where: {
          followerId: userId,
        },
        attributes: ['followingId'],
      })
      .then((followingArray) => {
        if (followingArray.length === 0) {
          return res.status(200).json({ feed: [] });
        }

        // get an array of userId the user is following
        const followings = [];
        followingArray.map(following => followings.push(following.followingId));

        // user sequelize option operators 'or'
        const { or } = Sequelize.Op;
        return Article
          .findAll({
            where: { [or]: [{ authorId: followings }] },
            order: [['createdAt', 'DESC']],
            limit: limit || 10,
          })
          .then(allArticle => res.status(200).json({ feed: allArticle }));
      })
      .catch(next);
  }
}

export default ArticleController;
