import Sequelize from 'sequelize';
import dateRange from '../helpers/filterDateRangeHelper';

// get the sequelize operator object
const { Op } = Sequelize;

const articleFilters = (req, res, next) => {
  const {
    title, description, body, startDate, endDate,
    username, firstName, lastName,
  } = req.query;

  req.filterByArticleAttributes = {
    [Op.and]: [
      {
        title: {
          [Op.like]: `%${title || ''}%`,
        },
      },
      {
        description: {
          [Op.like]: `%${description || ''}%`,
        },
      },
      {
        body: {
          [Op.like]: `%${body || ''}%`,
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
      [Op.like]: `%${username || ''}%`,
    },
    firstName: {
      [Op.like]: `%${firstName || ''}%`,
    },
    lastName: {
      [Op.like]: `%${lastName || ''}%`,
    },
  };
  return next();
};

export default articleFilters;
