import models from '../database/models';
import commentCtrlHelper from '../utils/helpers/commentCtrlHelper';
import errorHelper from '../utils/helpers/errorHelper';
import queryHelper from '../utils/helpers/queryHelper';

const {
  Article, Comment, sequelize,
} = models;

/**
 * The controller for comment routes
 */
class CommentController {
  /**
   * Create a comment
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} created comment success and error message on error
   */
  static createComment(req, res, next) {
    const { body: commentBody } = req.body.comment;
    const { slug } = req.params;
    const { id, username, image } = req.user;
    Article.findOne({ where: { slug } })
      .then((article) => {
        if (!article) errorHelper.throwError('Article not found', 404);
        return article.createComment({
          body: commentBody.trim(),
          authorId: id,
          type: 'main',
        });
      })
      .then(({ dataValues }) => {
        const comment = Object
          .assign(dataValues, { author: { username, image } });
        res.status(201).json({ comment });
      }).catch(next);
  }

  /**
   * Create a reply
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} created reply on success and error message on error
   */
  static createReply(req, res, next) {
    const { body: commentBody } = req.body.comment;
    const { slug, id: parentId } = req.params;
    const { id, username, image } = req.user;
    Article.findOne({ where: { slug } })
      .then((article) => {
        if (!article) errorHelper.throwError('Article not found', 404);
        return article.createComment({
          body: commentBody.trim(),
          authorId: id,
          type: 'reply',
          parentId,
        });
      })
      .then(({ dataValues }) => {
        const comment = Object
          .assign(dataValues, { author: { username, image } });
        res.status(201).json({ comment });
      }).catch(next);
  }

  /**
   * update a comment
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} updated on success and error message on error
   */
  static updateComment(req, res, next) {
    const { body: commentBody } = req.body.comment;
    const { id } = req.params;
    const { id: authorId } = req.user;
    const updateFields = [];
    if (commentBody && commentBody.trim()) updateFields.push('body');
    Comment.update({ body: commentBody }, {
      where: { id, authorId },
      fields: updateFields,
      returning: true,
    })
      .then(([updated, comment]) => {
        if (!updated) {
          errorHelper.throwError('Comment not found, or you do '
          + 'not have permission to update this comment', 404);
        }
        return res.status(200).json({ comment: comment[0] });
      }).catch(next);
  }

  /**
   * Get a single comment
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} a comment object
   * on success and error message on error
   */
  static getComment(req, res, next) {
    const { id } = req.params;
    return sequelize.query(queryHelper.getComment(id), {
      type: sequelize.QueryTypes.SELECT,
    })
      .then((rawComments) => {
        if (!rawComments.length) {
          errorHelper.throwError('Comment not found', 404);
        }
        const comment = commentCtrlHelper.parseComments(rawComments)[0];
        const commentsCount = rawComments[0].totalCount;
        return res.status(200)
          .json({ comment, commentsCount });
      }).catch(next);
  }

  /**
   * Get all the comments of an article
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} an array of comments
   * on success and error message on error
   */
  static getComments(req, res, next) {
    const { slug } = req.params;
    let { limit } = req.query;
    const { page } = req.query;
    Article.findOne({ where: { slug } })
      .then((article) => {
        if (!article) errorHelper.throwError('Article not found', 404);
        const articleId = article.id;
        limit = limit <= 20 ? limit : 20;
        const offset = page > 0 ? ((page - 1) * limit) : 0;
        // query the database to retrieve comments alongside their reply count
        return sequelize
          .query(queryHelper.getComments(articleId, limit, offset), {
            type: sequelize.QueryTypes.SELECT,
          });
      })
      .then((rawComments) => {
        const comments = commentCtrlHelper.parseComments(rawComments);
        const commentsCount = rawComments[0] ? rawComments[0].totalCount : 0;
        return res.status(200)
          .json({ comments, commentsCount });
      }).catch(next);
  }

  /**
   * Get all the replies to a comment
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} an array of comments on
   * success and error message on error
   */
  static getReplies(req, res, next) {
    const { slug, id: parentId } = req.params;
    let { limit } = req.query;
    const { page } = req.query;
    Article.findOne({ where: { slug } })
      .then((article) => {
        if (!article) errorHelper.throwError('Article not found', 404);
        const articleId = article.id;
        limit = limit <= 20 ? limit : 20;
        const offset = page > 0 ? ((page - 1) * limit) : 0;
        // query the database to retrieve comments alongside their reply count
        return sequelize
          .query(queryHelper.getReplies(articleId, parentId, limit, offset), {
            type: sequelize.QueryTypes.SELECT,
          });
      })
      .then((rawComments) => {
        const comments = commentCtrlHelper.parseComments(rawComments);
        const commentsCount = rawComments[0] ? rawComments[0].totalCount : 0;
        return res.status(200)
          .json({ comments, commentsCount });
      }).catch(next);
  }

  /**
   * Delete a comment
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - a call to the next function
   * @returns {Object} status code 200 on success and error message on error
   */
  static hideComment(req, res, next) {
    const { id } = req.params;
    const { id: authorId } = req.user;
    Comment.update({ deleted: true }, {
      where: { id, authorId },
    })
      .then(([deleted]) => {
        if (!deleted) {
          errorHelper.throwError('Comment not found', 404);
        }
        return res.status(204).send();
      }).catch(next);
  }
}

export default CommentController;
