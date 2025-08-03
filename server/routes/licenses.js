const express = require('express');
const router = express.Router();

// Import controllers
const {
  createLicenseApplication,
  getLicenseApplications,
  getLicenseApplication,
  updateLicenseApplication,
  getLicenseStats
} = require('../controllers/licenseController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const {
  validateLicenseApplication,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// Get license statistics (Admin only) - Must be before /:id route
router.get('/stats', protect, authorize('Admin'), getLicenseStats);

// Get user's licenses - Must be before /:id route
router.get('/my-licenses', protect, getLicenseApplications);

// Public user and admin routes
router.route('/')
  .get(protect, validatePagination, getLicenseApplications)
  .post(protect, validateLicenseApplication, createLicenseApplication);

router.route('/:id')
  .get(protect, validateObjectId, getLicenseApplication)
  .put(protect, validateObjectId, updateLicenseApplication);

module.exports = router; 