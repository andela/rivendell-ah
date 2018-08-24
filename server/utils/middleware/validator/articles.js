import validator from '../../helpers/validatorHelper';
import errorHelper from '../../helpers/errorHelper';
import checkSubcategory from '../../helpers/checkSubcategoryHelper';


/**
 * Function validates user inputs when creating an article
 * @param {Object} req the request body
 * @param {Object} res the response body
 * @param {function} next a call to the nect function
 * @returns {undefined}
 */
const createArticle = (req, res, next) => {
  if (!req.body.article) {
    errorHelper
      .throwError('No data specified. No Article created', 400);
  }
  // User inputs for creating an article
  const articleInput = {
    title: req.body.article.title,
    description: req.body.article.description,
    body: req.body.article.body,
    subcategory: req.body.article.subcategory,
  };
  // Validation of user Inputs
  const validation = validator.createArticleRules(articleInput);
  if (validation) {
    return res.status(400).json({
      errors: validation,
    });
  }

  // Check if subcategory exists in the database
  return checkSubcategory(req, res, next);
};

const updateArticle = (req, res, next) => {
  if (!req.body.article) {
    errorHelper
      .throwError('No data specified. No update was made', 400);
  }
  // User inputs for creating an article
  const articleInput = {
    title: req.body.article.title,
    description: req.body.article.description,
    body: req.body.article.body,
    subcategory: req.body.article.subcategory,
  };
    // Validation of user Inputs
  const validation = validator.updateArticleRules(articleInput);
  if (validation) {
    return res.status(400).json({
      errors: validation,
    });
  }

  // Check if subcategory exists in the database
  return checkSubcategory(req, res, next);
};

export default {
  createArticle,
  updateArticle,
};
