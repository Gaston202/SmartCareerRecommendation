const express = require('express');
const router = express.Router();
const {
  createAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdmin,
  deleteAdmin
} = require('../Controllers/adminController');
const { isAuth, isAutho } = require('../Middleware/auth');

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.post('/register', isAuth, isAutho('SUPER_ADMIN'), createAdmin);
router.get('/profile', isAuth, getAdminProfile);
router.put('/:id', isAuth, isAutho('SUPER_ADMIN'), updateAdmin);
router.delete('/:id', isAuth, isAutho('SUPER_ADMIN'), deleteAdmin);

module.exports = router;
