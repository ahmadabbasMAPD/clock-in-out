// server/models/User.js
const mongoose = require('mongoose');

// Define a schema for each clock entry
const clockEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['clockIn', 'clockOut'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Define the main user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
  },
  clockedIn: {
    type: Boolean,
    default: false,
  },
  lastClockIn: {
    type: Date,
  },
  lastClockOut: {
    type: Date,
  },
  clockEntries: [clockEntrySchema], // Array of clock entry objects
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;
