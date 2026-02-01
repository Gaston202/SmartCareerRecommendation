const express = require('express');
const router = express.Router();
const {
  createSkill,
  getAllSkills,
  updateSkill,
  deleteSkill
} = require('../Controllers/skillController');
const { isAuth, isAdmin } = require('../Middleware/auth');

// Public routes
router.get('/', getAllSkills);

// Protected routes (Admin only)
router.post('/', isAuth, isAdmin, createSkill);
router.put('/:id', isAuth, isAdmin, updateSkill);
router.delete('/:id', isAuth, isAdmin, deleteSkill);

module.exports = router;
