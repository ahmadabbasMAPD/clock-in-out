const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Clock In', 'Clock Out'], required: true },
    time: { type: Date, required: true },
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);