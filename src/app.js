const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

// security & logging
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// basic rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.'
});
app.use('/api', limiter);

// simple health check for monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// global error catch
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
