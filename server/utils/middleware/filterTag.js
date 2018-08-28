/**
 * This middleware function removes any empty string
 * in the tags attribute from the user's request body.
 * It calls the next() function once it is done
 *
 * @param {object} req the request object that contains the request
 * made by the user
 * @param {object} res  an object used to send response to the
 * client
 * @param {function} next used to send control to the next middleware
 * @returns {void} this method does not return any value
 */
const filterTag = (req, res, next) => {
  let { tags } = req.body.article;
  if (tags instanceof Array) {
    tags.splice(100); // get first 100 elements to be filtered
    tags = tags
      .map(str => str.toLowerCase())
      .filter((str, index, self) => str.trim().length > 0
        && self.indexOf(str) === index);
    tags.splice(20); // gets first 20 elements after filter
    req.body.article.tags = tags;
  } else {
    req.body.article.tags = [];
  }
  next();
};

export default filterTag;
