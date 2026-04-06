const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(409).json({ success: false, message: 'Email already in use.' });

    const newUser = await User.create({ name, email, password, role });
    const token = signToken(newUser._id);

    return res.status(201).json({ 
      success: true, 
      message: 'Registered successfully', 
      data: { token, user: { id: newUser._id, name, email, role: newUser.role } } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed. ' + err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      data: { token, user: { id: user._id, name: user.name, email, role: user.role } } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login failed. ' + err.message });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
};

module.exports = { register, login, getMe, registerRules, loginRules };
