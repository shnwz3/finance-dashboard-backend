const router = require('express').Router();
const {
  getSummary,
  getByCategory,
  getMonthlyTrends,
  getRecent,
} = require('../services/dashboard.service');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

// recent activity — available to all logged-in users
router.get('/recent', async (req, res) => {
  try {
    const data = await getRecent(10);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load recent activity.' });
  }
});

// the remaining dashboard endpoints need analyst or admin role
router.get('/summary', authorize('analyst', 'admin'), async (req, res) => {
  try {
    const data = await getSummary();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load summary.' });
  }
});

router.get('/by-category', authorize('analyst', 'admin'), async (req, res) => {
  try {
    const data = await getByCategory();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load category data.' });
  }
});

router.get('/trends', authorize('analyst', 'admin'), async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const data = await getMonthlyTrends(months);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load trends.' });
  }
});

module.exports = router;
