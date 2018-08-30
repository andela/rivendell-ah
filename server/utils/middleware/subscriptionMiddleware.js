import errorHelper from '../helpers/errorHelper';

/**
 * Validate notification subscription requests
 * @param {Object} req the request body
 * @param {Object} res the res body
 * @param {Function} next a call to the next middle function
 * @returns {Function} returns next
 */
const validateSubscriptionType = (req, res, next) => {
  if (!req.body.subscriptionType) {
    errorHelper.throwError('a subscriptionType is required', 400);
  }
  let { subscriptionType } = req.body;
  subscriptionType = subscriptionType.trim();
  if (subscriptionType === '') {
    errorHelper.throwError('subscriptionType can\'t be empty', 400);
  }
  if (subscriptionType !== 'email' && subscriptionType !== 'inApp') {
    errorHelper
      .throwError('only \'email\' and \'inApp\' are allowed in the field', 400);
  }
  req.body.subscriptionType = subscriptionType;
  next();
};

export default validateSubscriptionType;
