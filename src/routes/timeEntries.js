// routes/timeEntries.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.put('/:userId/clockin', async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findByIdAndUpdate(userId, {
    $push: { clockEntries: { date: new Date(), clockIn: new Date(), clockOut: null } }
  }, { new: true });
  res.json(user);
});

router.put('/:userId/clockout', async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findByIdAndUpdate(userId, {
    $set: { 'clockEntries.$[last].clockOut': new Date() }
  }, { arrayFilters: [{ 'last.clockOut': null }], new: true });
  res.json(user);
});

module.exports = router;