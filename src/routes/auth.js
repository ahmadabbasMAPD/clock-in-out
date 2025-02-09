const express = require('express');
const cors = require('cors');
const router = express.Router();
const User = require('../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
    try {
      const { username, password, role } = req.body;
  
      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      // Store the plain-text password directly
      const newUser = new User({
        username,
        password, // Plain text password
        role,
      });
  
      // Save user to the database
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
// Login Route
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      console.log('Login attempt started');
      console.log('Input Username:', username);
      console.log('Input Password:', password);
  
      // Find the user by username
      const user = await User.findOne({ username });
      console.log('User found:', !!user);
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      console.log('Stored Password:', user.password);
  
      // Compare plain text passwords
      if (password !== user.password) {
        console.log('Password mismatch');
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Generate token
      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      console.log('Token Generated');
      res.status(200).json({ token, username: user.username, role: user.role });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  

// Verify Token Route
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      res.status(200).json({ message: 'Token is valid', userId: decoded.userId });
    });
  } catch (error) {
    console.error('Error in token verification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
