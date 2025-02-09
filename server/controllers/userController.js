// server/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// Get current user details (excluding password)
exports.getCurrentUser = async (req, res) => {
  console.log("[DEBUG] getCurrentUser - req.user:", req.user);
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    console.log("[DEBUG] getCurrentUser - Fetched user from DB:", user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error("[DEBUG] getCurrentUser - Error:", err);
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
};

// New: Update time entries for a specific day
exports.updateTimeEntries = async (req, res) => {
  try {
    const { date, clockIn, clockOut } = req.body;
    let errors = [];

    // Validate required fields.
    if (!date) {
      errors.push("Date is required.");
    }
    if (!clockIn && !clockOut) {
      errors.push("At least one of clockIn or clockOut must be provided.");
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    // Helper: format a Date as "YYYY-MM-DD"
    const formatDate = (d) => d.toISOString().split('T')[0];

    const payloadDate = new Date(date);
    if (isNaN(payloadDate.getTime())) {
      errors.push("Invalid date format for date.");
    }

    // Only allow editing for today's entries.
    const today = new Date();
    if (formatDate(payloadDate) !== formatDate(today)) {
      errors.push("You can only edit today's time entries. Changing the date is not allowed.");
    }

    // Parse clock times (if provided)
    const newClockIn = clockIn ? new Date(clockIn) : null;
    const newClockOut = clockOut ? new Date(clockOut) : null;

    // Validate that clockIn is before clockOut if both are provided.
    if (newClockIn && newClockOut && newClockIn >= newClockOut) {
      errors.push("Clock In time must be before Clock Out time.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    // Retrieve the user (set by the protect middleware)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Group existing clock entries by date
    const groupedEntries = {};
    user.clockEntries.forEach(entry => {
      const key = formatDate(new Date(entry.timestamp));
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      groupedEntries[key].push(entry);
    });

    const todayKey = formatDate(today);
    const todayEntries = groupedEntries[todayKey];
    if (!todayEntries || todayEntries.length === 0) {
      return res.status(400).json({ error: "No time entries exist for today. Cannot update." });
    }

    let updated = false;

    // Update existing clockIn entry, if a new clockIn time is provided.
    if (newClockIn) {
      const clockInEntry = todayEntries.find(entry => entry.type === 'clockIn');
      if (!clockInEntry) {
        errors.push("No clockIn entry exists for today to update.");
      } else {
        clockInEntry.timestamp = newClockIn;
        updated = true;
      }
    }

    // Update existing clockOut entry, if a new clockOut time is provided.
    if (newClockOut) {
      const clockOutEntry = todayEntries.find(entry => entry.type === 'clockOut');
      if (!clockOutEntry) {
        errors.push("No clockOut entry exists for today to update.");
      } else {
        clockOutEntry.timestamp = newClockOut;
        updated = true;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }
    if (!updated) {
      return res.status(400).json({ error: "No valid updates provided." });
    }

    await user.save();
    return res.json({ message: "Time entries updated successfully", user });
  } catch (err) {
    console.error("Error in updateTimeEntries:", err);
    return res.status(500).json({ error: "Failed to update time entries", details: err.message });
  }
};



// Create new user (Registration)
exports.createUser = async (req, res) => {
  try {
    const { username, password, role, phone } = req.body;

    // Validate input
    if (!validator.isLength(username, { min: 3, max: 20 })) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }
    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (!validator.isMobilePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role,
      phone,
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
};

// Clock In: Set user as clocked in, update lastClockIn, and push a new clock entry.
exports.clockIn = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.clockedIn) return res.status(400).json({ error: 'User is already clocked in' });

    user.clockedIn = true;
    const now = new Date();
    user.lastClockIn = now;
    user.clockEntries.push({ type: 'clockIn', timestamp: now });

    await user.save();
    res.json({ message: 'Clocked in successfully', user });
  } catch (err) {
    console.error("Error in clockIn:", err);
    res.status(500).json({ error: 'Failed to clock in', details: err.message });
  }
};

// Clock Out: Set user as clocked out, update lastClockOut, and push a new clock entry.
exports.clockOut = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.clockedIn) return res.status(400).json({ error: 'User is not clocked in' });

    user.clockedIn = false;
    const now = new Date();
    user.lastClockOut = now;
    user.clockEntries.push({ type: 'clockOut', timestamp: now });

    await user.save();
    res.json({ message: 'Clocked out successfully', user });
  } catch (err) {
    console.error("Error in clockOut:", err);
    res.status(500).json({ error: 'Failed to clock out', details: err.message });
  }
};

// Get all users (excluding passwords)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

// Get a single user by ID (excluding password)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
};

// Update a user by ID (excluding password update unless specifically handled)
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

exports.getWorkHours = async (req, res) => {
  try {
    // Retrieve the user (the protect middleware attaches the user ID to req.user)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Group clock entries by day.
    const entriesByDay = {};
    user.clockEntries.forEach(entry => {
      const dateKey = new Date(entry.timestamp).toLocaleDateString();
      if (!entriesByDay[dateKey]) {
        entriesByDay[dateKey] = [];
      }
      entriesByDay[dateKey].push(entry);
    });

    // Calculate daily hours.
    const dailyHours = {};
    Object.keys(entriesByDay).forEach(dateKey => {
      const entries = entriesByDay[dateKey];
      // Sort the entries by timestamp.
      entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      // For simplicity, pair the first clockIn with the first clockOut.
      const clockIn = entries.find(e => e.type === 'clockIn');
      const clockOut = entries.find(e => e.type === 'clockOut');
      if (clockIn && clockOut) {
        const hours = (new Date(clockOut.timestamp) - new Date(clockIn.timestamp)) / (1000 * 60 * 60);
        dailyHours[dateKey] = hours;
      } else {
        dailyHours[dateKey] = 0;
      }
    });

    // Compute weekly total hours (assuming current week starts on Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, etc.
    // Calculate difference to Monday (if Sunday, consider it as day 7 for calculation)
    const diffToMonday = (dayOfWeek + 6) % 7; // Monday=0, Tuesday=1, ..., Sunday=6.
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    let weekTotal = 0;
    Object.keys(dailyHours).forEach(dateKey => {
      const d = new Date(dateKey);
      if (d >= monday && d < new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        weekTotal += dailyHours[dateKey];
      }
    });

    // Compute biweekly total hours: current week plus previous week.
    const previousMonday = new Date(monday);
    previousMonday.setDate(monday.getDate() - 7);
    let biweekTotal = weekTotal;
    Object.keys(dailyHours).forEach(dateKey => {
      const d = new Date(dateKey);
      if (d >= previousMonday && d < monday) {
        biweekTotal += dailyHours[dateKey];
      }
    });

    res.json({
      dailyHours,
      weekTotal,
      biweekTotal,
    });
  } catch (err) {
    console.error('Error in getWorkHours:', err);
    res.status(500).json({ error: 'Failed to compute work hours', details: err.message });
  }
};
