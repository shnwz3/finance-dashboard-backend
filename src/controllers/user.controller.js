const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    // only allow updating these specific fields
    const allowedFields = ['role', 'isActive', 'name'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Update failed. ' + err.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User deactivated', data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Deactivation failed.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser };
