const Transaction = require('../models/Transaction');

/*
 * Aggregate total income, total expenses and compute net balance.
 */
const getSummary = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  result.forEach(({ _id, total }) => {
    if (_id === 'income') summary.totalIncome = total;
    if (_id === 'expense') summary.totalExpenses = total;
  });
  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  return summary;
};

/*
 * Group totals by category and type.
 */
const getByCategory = async () => {
  return Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

/*
 * Monthly trend data for the last N months (default 6).
 */
const getMonthlyTrends = async (months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  return Transaction.aggregate([
    { $match: { isDeleted: false, date: { $gte: since } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

/*
 * Most recent N transactions.
 */
const getRecent = async (limit = 10) => {
  return Transaction.find()
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .limit(limit);
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getRecent };
