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
      status: 'fail',
      error: validation,
    });
  }

  if (req.body.article.title === ''
  || (req.body.article.title
    && req.body.article.title.trim() === '')) {
    return res.status(422).json({
      errors: {
        message: 'The title must be specified',
      },
    });
  }
  if (req.body.article.description === ''
  || (req.body.article.description
    && req.body.article.description.trim() === '')) {
    return res.status(422).json({
      errors: {
        message: 'The description must be specified',
      },
    });
  }
  if (req.body.article.body === ''
  || (req.body.article.body
    && req.body.article.body.trim() === '')) {
    return res.status(422).json({
      errors: {
        message: 'The body must be specified',
      },
    });
  }

  return next();
};

export default {
  createArticle,
  updateArticle,
};
