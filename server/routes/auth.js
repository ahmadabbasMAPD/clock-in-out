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
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid username or password', 
                statusCode: 401 
            });
        }

        // Compare hashed passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid username or password', 
                statusCode: 401 
            });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({ 
            token, 
            username: user.username, 
            role: user.role,
            statusCode: 200 
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message,
            statusCode: 500 
        });
    }
});

// Verify Token Route
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
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

// Logout Route
router.post('/logout', async (req, res) => {
    try {
        // Perform any cleanup if necessary, such as logging user activity
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
