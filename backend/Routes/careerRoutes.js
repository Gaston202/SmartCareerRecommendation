const express = require('express');
const router = express.Router();
const {
  createCareer,
  getAllCareers,
  getCareerById,
  updateCareer,
  deleteCareer
} = require('../Controllers/careerController');
const { isAuth, isAdmin } = require('../Middleware/auth');

// Public routes
router.get('/', getAllCareers);
router.get('/:id', getCareerById);

// Protected routes (Admin only)
router.post('/', isAuth, isAdmin, createCareer);
router.put('/:id', isAuth, isAdmin, updateCareer);
router.delete('/:id', isAuth, isAdmin, deleteCareer);

module.exports = router;
