import Sequelize from 'sequelize';
import dateRange from '../helpers/filterDateRangeHelper';

// get the sequelize operator  object
const { Op } = Sequelize;

const articleFilters = (req, res, next) => {
  const {
    title = '', description = '', body = '', startDate, endDate,
    username = '', firstName = '', lastName = '', subcategory = '', tag,
  } = req.query;
  req.filterByArticleAttributes = {
    [Op.and]: [
      {
        title: {
          [Op.iLike]: `%${title}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${description}%`,
        },
      },
      {
        body: {
          [Op.iLike]: `%${body}%`,
        },
      },
      {
        createdAt: {
          [Op.between]: dateRange(startDate, endDate),
        },
      },
    ],
  };
  req.filterByAuthorAttributes = {
    username: {
      [Op.iLike]: `%${username}%`,
    },
    firstName: {
      [Op.iLike]: `%${firstName}%`,
    },
    lastName: {
      [Op.iLike]: `%${lastName}%`,
    },
  };

  req.filterBySubcategoryAttributes = {
    name: {
      [Op.iLike]: `%${subcategory}%`,
    },
  };

  if (tag) {
    req.filterByTag = {
      name: {
        [Op.iLike]: `%${tag}%`,
      },
    };
  }
  return next();
};

export default articleFilters;
