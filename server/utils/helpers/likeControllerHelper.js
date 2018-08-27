export default {
  /**
     *This etracts the UUID in a slug. Note that this functions assumes that
     the UUID used here is 36 character length
     @param {string} slug the slug that we want to extract the id from
     @returns {string} a string containing the UUID of the article
     */
  extractId: slug => slug.substr(-36),
};
