import models from '../database/models';
import articleControllerHelper from '../utils/helpers/articleControllerHelper';

const { Category, Subcategory } = models;

/**
 *
 * The CategoryController contains static methods that are used as
 * controllers to handle the different category routes.
 *  @class CategoryController
 *  @returns {undefined} this is a class thus does not return anything
 */
class CategoryController {
/**
   * Method gets all categories from the database,
   * It returns a json response of the categories retrieved
   * It handles the GET /api/categories.
   * @param {Object} req the request body
   * @param {Object} res the response body
   * @param {function} next a call to the next function
   * @returns {Object} the response body
   */
  static getAllCategories(req, res, next) {
    Category.findAll({
      include: [
        articleControllerHelper.includeSubcategories(Subcategory),
      ],
      attributes: ['name'],
    })
      .then(categories => res.status(200).json({
        categories,
      }))
      .catch(next);
  }
}
export default CategoryController;
