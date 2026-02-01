const express = require('express');
const router = express.Router();
const {
  generateRecommendations,
  getRecommendationsByUser,
  deleteRecommendation
} = require('../Controllers/recommendationController');
const { isAuth, isOwnerOrAdmin } = require('../Middleware/auth');

// Protected routes
router.post('/generate/:userId', isAuth, isOwnerOrAdmin('userId'), generateRecommendations);
router.get('/user/:userId', isAuth, isOwnerOrAdmin('userId'), getRecommendationsByUser);
router.delete('/:id', isAuth, deleteRecommendation);

module.exports = router;
