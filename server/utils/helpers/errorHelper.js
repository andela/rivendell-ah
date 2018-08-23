/**
 * An abstraction for the error 404: not found
 * @param {String} message the error message
 * @param {Number} status status code
 * @returns {Object} an error
 */
const throwError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

export default {
  throwError,
};
