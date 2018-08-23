import slugCreate from 'slug';
import uuid from 'uuid/v1';
import models from '../database/models';
import articleControllerHelper from '../utils/helpers/articleControllerHelper';

const { Article, User } = models;

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
      title, description, body,
    } = req.body.article;

    // generating a slug
    const id = uuid();
    const slug = slugCreate(`${title.toLowerCase()}-${id}`);
    const authorId = req.body.decoded.id;


    const {
      username, bio, image,
    } = req.user;

    Article.create({
      id, slug, title, description, body, authorId,
    })
      .then(article => res.status(201).json({
        article: articleControllerHelper
          .createArticleResponse(article, username, bio, image, slug),
      })).catch(next);
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
      include: [{
        model: User,
        as: 'author',
        attributes: [
          'username', 'bio', 'image',
        ],
      }],
      attributes: [
        'slug', 'title', 'description',
        'body', 'createdAt', 'updatedAt',
      ],
    })
      .then((article) => {
        if (!article) {
          return res.status(404).json({
            message: 'Article not found',
          });
        }
        return res.status(200).json({
          article,
        });
      })
      .catch(next);
  }

  /**
   * Method gets all articles from the database,
   * It returns a json response of the article retrieved
   * It handles the GET /api/articles.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getAllArticle(req, res, next) {
    let { limit, page } = req.query;
    limit = +limit < 20 && +limit > 0 ? +limit : 20;
    page = +page > 0 ? +page : 1;
    const offset = limit * (page - 1);

    Article.findAndCountAll({
      limit,
      offset,
      include: [{
        model: User,
        as: 'author',
        attributes: [
          'username', 'bio', 'image',
        ],
      }],
      attributes: [
        'slug', 'title', 'description',
        'body', 'createdAt', 'updatedAt',
      ],
      order: [['createdAt', 'DESC']],
    })
      .then(articles => res.status(200).json({
        articles: articles.rows,
        articlesCount: articles.count,
      }))
      .catch(next);
  }

  /**
   * Method updates an article in the database,
   * It returns a json response of the article updated
   * It handles the PUT /api/articles/:slug.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static updateArticle(req, res, next) {
    const {
      title, description, body,
    } = req.body.article;
    const authorId = req.body.decoded.id;
    const updateField = [];

    if (title && title.trim()) updateField.push('title');
    if (description && description.trim()) updateField.push('description');
    if (body && body.trim()) updateField.push('body');

    Article.update(
      {
        title, description, body,
      },
      {
        where: { slug: req.params.slug, authorId },
        returning: true,
        fields: updateField,
      },
    )
      .then(([updated, article]) => {
        if (!updated) {
          return res.status(404).json({
            message: 'Article not found. Cannot Update',
          });
        }
        return res.status(200).json({
          article: article[0],
        });
      })
      .catch(next);
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
          return res.status(404).json({
            message: 'Article not found',
          });
        }
        return res.status(200).json();
      })
      .catch(next);
  }
}

export default ArticleController;