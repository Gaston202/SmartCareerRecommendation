const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse
} = require('../Controllers/courseController');
const { isAuth, isAdmin } = require('../Middleware/auth');

// Public routes
router.get('/', getAllCourses);

// Protected routes (Admin only)
router.post('/', isAuth, isAdmin, createCourse);
router.put('/:id', isAuth, isAdmin, updateCourse);
router.delete('/:id', isAuth, isAdmin, deleteCourse);

module.exports = router;
