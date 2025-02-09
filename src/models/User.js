// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  clockEntries: [{ date: Date, clockIn: Date, clockOut: Date }]
});

userSchema.pre('save', function (next) {
    console.log('Saving password as plain text:', this.password);
    next();
  });

module.exports = mongoose.model('User', userSchema);
