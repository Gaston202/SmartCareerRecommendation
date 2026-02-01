const express = require('express');
const router = express.Router();
const {
  createAnalytics,
  getAnalyticsSummary,
  getUserAnalytics
} = require('../Controllers/analyticsController');
const { isAuth, isAdmin, isOwnerOrAdmin } = require('../Middleware/auth');

// Protected routes
router.post('/', isAuth, createAnalytics);
router.get('/summary', isAuth, isAdmin, getAnalyticsSummary);
router.get('/user/:userId', isAuth, isOwnerOrAdmin('userId'), getUserAnalytics);

module.exports = router;
