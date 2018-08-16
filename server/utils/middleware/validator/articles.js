import validator from '../../helpers/validatorHelper';

/**
 * Function validates user inputs when creating an article
 * @param {Object} req the request body
 * @param {Object} res the response body
 * @param {function} next a call to the nect function
 * @returns {undefined}
 */
const createArticle = (req, res, next) => {
  if ((!req.body.article) || (!req.body.article.body
    && !req.body.article.description
    && !req.body.article.title)) {
    return res.status(422).json({
      errors: { message: 'No data specified. No Article created' },
    });
  }
  // User inputs for creating an article
  const articleInput = {
    title: req.body.article.title,
    description: req.body.article.description,
    body: req.body.article.body,
  };
  // Validation of user Inputs
  const validation = validator.createArticleRules(articleInput);
  if (validation) {
    return res.status(400).json({
      error: validation,
    });
  }
  return next();
};

const updateArticle = (req, res, next) => {
  if ((!req.body.article) || (!req.body.article.body
    && !req.body.article.description
    && !req.body.article.title)) {
    return res.status(422).json({
      errors: { message: 'No data specified. No update was made' },
    });
  }
  // User inputs for creating an article
  const articleInput = {
    title: req.body.article.title,
    description: req.body.article.description,
    body: req.body.article.body,
  };
    // Validation of user Inputs
  const validation = validator.updateArticleRules(articleInput);
  if (validation) {
    return res.status(400).json({
      error: validation,
    });
  }
  return next();
};

export default {
  createArticle,
  updateArticle,
};
