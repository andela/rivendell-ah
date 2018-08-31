const setPaginationParameters = (req) => {
  let { limit, page } = req.query;
  limit = +limit < 20 && +limit > 0 ? +limit : 20;
  page = +page > 0 ? +page : 1;
  const offset = limit * (page - 1);

  const pagination = {
    limit,
    page,
    offset,
  };
  return pagination;
};

export default setPaginationParameters;
