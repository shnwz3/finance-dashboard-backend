const router = require('express').Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// every route below requires admin role
router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deactivateUser);

module.exports = router;
