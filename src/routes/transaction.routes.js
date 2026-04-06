const router = require('express').Router();
const {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  transactionRules,
} = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

// all transaction routes need auth
router.use(protect);

// read — any logged-in user
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

// write — admin only
router.post('/', authorize('admin'), transactionRules, validate, createTransaction);
router.put('/:id', authorize('admin'), transactionRules, validate, updateTransaction);
router.patch('/:id', authorize('admin'), updateTransaction);
router.delete('/:id', authorize('admin'), deleteTransaction);

module.exports = router;
