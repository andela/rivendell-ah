import models from '../../database/models';
import errorHelper from './errorHelper';

const { Subcategory } = models;

const checkSubcategory = (req, res, next) => {
  // Checking if subcategory exists in the database
  const { subcategory = '' } = req.body.article;
  if (subcategory.trim()) {
    return Subcategory.findOne({
      where: { name: subcategory.toUpperCase() },
    })
      .then((subcategoryDetails) => {
        if (!subcategoryDetails) {
          errorHelper.throwError('Subcategory specified does not exist', 404);
        }
        req.body.subcategoryDetails = subcategoryDetails;
        return next();
      })
      .catch(next);
  }
  return next();
};
export default checkSubcategory;
