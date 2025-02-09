const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import auth middleware
const TimeEntry = require('../models/TimeEntry'); // Assuming a TimeEntry model

router.get('/', protect, async (req, res) => {
    try {
        const timeEntries = await TimeEntry.find({ userId: req.user._id }); // Fetch entries for the logged-in user
        res.json(timeEntries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch time entries' });
    }
});


router.post('/', protect, async (req, res) => {
    try {
        const { type } = req.body; // type should be 'Clock In' or 'Clock Out'

        if (type !== 'Clock In' && type !== 'Clock Out') {
            return res.status(400).json({ error: 'Invalid time entry type' });
        }

        const newTimeEntry = new TimeEntry({
            userId: req.user._id,
            type,
            time: new Date(),
        });

        await newTimeEntry.save();
        res.status(201).json({ message: 'Time entry created successfully', timeEntry: newTimeEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create time entry', details: err.message });
    }
});

module.exports = router;
