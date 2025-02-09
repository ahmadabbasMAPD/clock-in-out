// server/middleware/authMiddleware.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Adjusted path assuming this file is in server/middleware

// -----------------------------
// Protect Middleware
// -----------------------------
// This middleware checks for a valid JWT in the Authorization header.
// If valid, it attaches the authenticated user to the request object.
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log("[DEBUG] protect - Retrieved token:", token);

    try {
      // Verify the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[DEBUG] protect - Decoded token:", decoded);

      // Find the user by ID from the decoded token payload and exclude the password field
      const user = await User.findById(decoded.userId).select('-password');
      console.log("[DEBUG] protect - Fetched user from DB:", user);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("[DEBUG] protect - Error in authentication:", error);
      if (error.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// -----------------------------
// Authentication Routes
// -----------------------------

// Register Route: Create a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Login Route: Authenticate user and issue a JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password',
        statusCode: 401,
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid username or password',
        statusCode: 401,
      });
    }

    // Sign a JWT with a 2-hour expiration
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      token,
      username: user.username,
      role: user.role,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      statusCode: 500,
    });
  }
});

// Verify Token Route: Check if a token is valid
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Token is valid', userId: decoded.userId });
  } catch (error) {
    console.error('Error in token verification:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token', error: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
});

// Logout Route: Handle logout (cleanup if needed)
router.post('/logout', async (req, res) => {
  try {
    // Optionally perform cleanup or logging here.
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Attach the protect middleware as a property on the router so it can be used elsewhere
router.protect = protect;

module.exports = router;
