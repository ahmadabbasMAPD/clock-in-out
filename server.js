// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');

const authRoutes = require('./src/routes/auth');
const timeEntryRoutes = require('./src/routes/timeEntries');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timeEntries', timeEntryRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
