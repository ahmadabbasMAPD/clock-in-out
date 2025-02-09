// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Create the Express app instance
const app = express();

// Use Helmet to secure HTTP headers
app.use(helmet());

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Adjust as needed for your client
  credentials: true,
};
app.use(cors(corsOptions));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Create a rate limiter for login requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
});

// Apply the rate limiter specifically to the login route.
// (This must be applied after the app is created.)
app.use('/api/auth/login', loginLimiter);

// Import your route modules
const authRoutes = require('./routes/auth');
const timeEntryRoutes = require('./routes/timeEntries');
const userRoutes = require('./routes/userRoutes');

// Use a fallback MongoDB URI if process.env.MONGODB_URI is not set
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clock-in-out';

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/time-entries', timeEntryRoutes); // If you have time entries routes

// Fallback for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server on the specified port (defaulting to 3001)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
