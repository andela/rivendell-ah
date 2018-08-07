
const ratingServices = {
  /**
   * @param {array} ratingArray array of ratings
   * @returns {Object} object contain rating detailRating
   */
  computeRating(ratingArray) {
    let sumOfRating = 0;
    const ratingCount = ratingArray.length;
    ratingArray.forEach((rating) => {
      sumOfRating += parseInt(rating.rating, 10);
    });
    let averageRating = sumOfRating / ratingCount;
    averageRating = averageRating.toPrecision(3);
    return {
      ratingDetail: {
        ratingCount,
        averageRating,
      },
    };
  },
};

export default ratingServices;
