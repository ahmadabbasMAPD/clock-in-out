// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  res.json(user);
});

router.get('/', async (req, res) => {
  const users = await User.find().select('-password'); // Exclude password for security
  res.json(users);
});

module.exports = router;
