const express = require('express');
const router = express.Router();

// Import controllers
const {
  signup,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/authController');

// Import middleware
const { protect, authorize, rateLimitSensitive } = require('../middleware/auth');
const {
  validateSignup,
  validateLogin,
  validateUpdatePassword,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// Public routes
router.post('/signup', rateLimitSensitive, validateSignup, signup);
router.post('/login', rateLimitSensitive, validateLogin, login);

// Protected routes
router.get('/verify', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, validateUpdatePassword, updatePassword);

// Admin only routes
router.get('/users', protect, authorize('Admin'), validatePagination, getUsers);
router.get('/users/:id', protect, authorize('Admin'), validateObjectId, getUser);
router.put('/users/:id', protect, authorize('Admin'), validateObjectId, updateUser);
router.delete('/users/:id', protect, authorize('Admin'), validateObjectId, deleteUser);

module.exports = router; 