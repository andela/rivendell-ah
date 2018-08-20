import slugCreate from 'slug';
import uuid from 'uuid/v1';
import models from '../database/models';
import articleControllerHelper from '../utils/helpers/articleControllerHelper';
import errorHelper from '../utils/helpers/errorHelper';

const { Article, User, Tag } = models;

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
      title, description, body, tags,
    } = req.body.article;
    // generating a slug
    const id = uuid();
    const slug = slugCreate(`${title.toLowerCase()}-${id}`);
    const authorId = req.body.decoded.id;


    const {
      username, bio, image,
    } = req.user;

    const newArticle = {
      id, slug, title, description, body, authorId,
    };

    Article.create(newArticle)
      .then((article) => {
        articleControllerHelper.createAndFindTags(tags)
          .then((tagInstances) => {
            article.addTags(tagInstances)
              .then(() => {
                const articleResponse = articleControllerHelper
                  .createArticleResponse(article, username, bio, image);
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
        articleControllerHelper.includeAuthor(User, req.filterByAuthor),
        articleControllerHelper.includeTag(Tag, req.filterByTag),
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
      return res.status(200).json({
        article: articleObj,
      });
    }).catch(next);
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
      distinct: 'id',
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where: req.filterByArticleAttributes,
      include: [
        articleControllerHelper
          .includeAuthor(User, req.filterByAuthorAttributes),
        articleControllerHelper
          .includeTag(Tag, req.filterByTag),
      ],
      attributes: articleControllerHelper
        .articleAttributes(true),
    }).then((articles) => {
      const finalArticleResponseObj = articles
        .rows.map(({ dataValues }) => {
          const articleObj = dataValues;
          articleObj.tags = articleControllerHelper
            .formatTagResponse(articleObj.tags);
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
   * It handles the PUT /api/articles/:slug.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static updateArticle(req, res, next) {
    const { title, description, body } = req.body.article;
    const authorId = req.body.decoded.id;
    const updateField = [];
    if (title && title.trim()) updateField.push('title');
    if (description && description.trim()) updateField.push('description');
    if (body && body.trim()) updateField.push('body');
    Article.update(
      { title, description, body },
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
}

export default ArticleController;
