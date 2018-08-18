const filterDateRangeHelper = (start, end) => {
  let startDate;
  let endDate;

  // return date range that covers all articles in the database
  // if no date query is specified
  if (!start && !end) {
    startDate = new Date('2018-07-01');
    endDate = new Date();
    // return a specific day range if only startDate is specified
  } else if (!end) {
    startDate = new Date(start);
    endDate = new Date(`${start}T23:59:59.00Z`);
    // return a specific day range if only endDate is specified
  } else if (!start) {
    startDate = new Date(end);
    endDate = new Date(`${end}T23:59:59.00Z`);
  } else {
    // return  specified date range
    startDate = new Date(start);
    endDate = new Date(`${end}T23:59:59.00Z`);
  }

  // set invalid date value(s) to default date values
  startDate = startDate.toString() !== 'Invalid Date' ? startDate
    : new Date('2018-07-01');
  endDate = endDate.toString() !== 'Invalid Date' ? endDate
    : new Date();

  return [startDate, endDate];
};

export default filterDateRangeHelper;
