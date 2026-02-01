const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../Controllers/userController');
const { isAuth, isAdmin, isOwnerOrAdmin } = require('../Middleware/auth');

// Public routes
router.post('/', createUser);

// Protected routes
router.get('/', isAuth, isAdmin, getAllUsers);
router.get('/:id', isAuth, getUserById);
router.put('/:id', isAuth, isOwnerOrAdmin('id'), updateUser);
router.delete('/:id', isAuth, isAdmin, deleteUser);

module.exports = router;
