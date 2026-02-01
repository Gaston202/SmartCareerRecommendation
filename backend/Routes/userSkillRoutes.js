const express = require('express');
const router = express.Router();
const {
  addUserSkill,
  getUserSkills,
  getUsersBySkill,
  updateUserSkill,
  deleteUserSkill,
  bulkAddUserSkills,
  getSkillGapAnalysis
} = require('../Controllers/userSkillController');
const { isAuth, isAdmin, isOwnerOrAdmin } = require('../Middleware/auth');

// Protected routes
router.post('/', isAuth, addUserSkill);
router.post('/bulk', isAuth, bulkAddUserSkills);
router.get('/user/:userId', isAuth, isOwnerOrAdmin('userId'), getUserSkills);
router.get('/skill/:skillId', isAuth, isAdmin, getUsersBySkill);
router.get('/gap-analysis/:userId/:careerId', isAuth, isOwnerOrAdmin('userId'), getSkillGapAnalysis);
router.put('/:id', isAuth, updateUserSkill);
router.delete('/:id', isAuth, deleteUserSkill);

module.exports = router;
