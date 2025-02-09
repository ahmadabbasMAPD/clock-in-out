// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { getCurrentUser } = require('../controllers/userController');

// Static routes (must come before dynamic routes)
router.get('/current-user', protect, userController.getCurrentUser);
router.put('/current-user/clock-in', protect, userController.clockIn);
router.put('/current-user/clock-out', protect, userController.clockOut);
router.put('/clock-in', protect, userController.clockIn); // Additional clock-in endpoint if needed

// New endpoint for updating time entries
router.put('/current-user/time-entries', protect, userController.updateTimeEntries);

// Public/Protected endpoints for admin
router.get('/', protect, userController.getUsers);  // Returns all users


// Other routes
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

router.get('/current-user/work-hours', protect, userController.getWorkHours);

module.exports = router;
