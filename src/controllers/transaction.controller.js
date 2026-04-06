const { body } = require('express-validator');
const Transaction = require('../models/Transaction');

const transactionRules = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Date must be a valid ISO8601 date'),
  body('notes').optional().isString(),
];

// fetch all with filters
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = new RegExp(category, 'i');

    if (search) {
      filter.$or = [
        { category: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [txns, total] = await Promise.all([
      Transaction.find(filter)
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        transactions: txns,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    const tx = await Transaction.create({
      amount,
      type,
      category,
      date,
      notes,
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, message: 'Transaction created', data: tx });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create transaction. ' + err.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    return res.status(200).json({ success: true, data: tx });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transaction.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    return res.status(200).json({ success: true, message: 'Transaction updated', data: tx });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Update failed. ' + err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    return res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  transactionRules,
};
