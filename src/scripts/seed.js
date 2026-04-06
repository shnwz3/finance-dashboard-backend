/*
 * Seed script — populates the database with sample users and transactions.
 * Run with: npm run seed
 *
 * Creates one user per role (admin, analyst, viewer) and a handful
 * of transactions spread across categories and dates.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_db';

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
  { name: 'Analyst User', email: 'analyst@example.com', password: 'password123', role: 'analyst' },
  { name: 'Viewer User', email: 'viewer@example.com', password: 'password123', role: 'viewer' },
];

const sampleTransactions = [
  { amount: 50000, type: 'income', category: 'Salary', date: '2025-04-01', notes: 'April salary' },
  { amount: 15000, type: 'expense', category: 'Rent', date: '2025-04-02', notes: 'Monthly rent' },
  { amount: 3000, type: 'expense', category: 'Food', date: '2025-04-03', notes: 'Groceries' },
  { amount: 1200, type: 'expense', category: 'Transport', date: '2025-04-05', notes: 'Fuel' },
  { amount: 8000, type: 'income', category: 'Freelance', date: '2025-04-07', notes: 'Side project' },
  { amount: 2500, type: 'expense', category: 'Food', date: '2025-04-10', notes: 'Eating out' },
  { amount: 45000, type: 'income', category: 'Salary', date: '2025-03-01', notes: 'March salary' },
  { amount: 15000, type: 'expense', category: 'Rent', date: '2025-03-02', notes: 'March rent' },
  { amount: 5000, type: 'expense', category: 'Utilities', date: '2025-03-05', notes: 'Electricity bill' },
  { amount: 10000, type: 'income', category: 'Freelance', date: '2025-02-15', notes: 'Contract work' },
  { amount: 4000, type: 'expense', category: 'Entertainment', date: '2025-02-20', notes: 'Concert tickets' },
  { amount: 48000, type: 'income', category: 'Salary', date: '2025-02-01', notes: 'February salary' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // wipe existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared old data');

    // create users
    const createdUsers = await User.create(users);
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    console.log(`Created ${createdUsers.length} users`);

    // create transactions (all owned by admin for simplicity)
    const txns = sampleTransactions.map((t) => ({
      ...t,
      date: new Date(t.date),
      createdBy: adminUser._id,
    }));
    await Transaction.insertMany(txns);
    console.log(`Created ${txns.length} transactions`);

    console.log('\nSeed complete. You can log in with:');
    console.log('  admin@example.com / password123');
    console.log('  analyst@example.com / password123');
    console.log('  viewer@example.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
