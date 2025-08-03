const express = require('express');
const router = express.Router();

// Import controllers
const {
  getTransportRoutes,
  getTransportRoute,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
  updateRealTimeInfo,
  getTransportStats,
  searchRoutesByLocation
} = require('../controllers/transportController');

// Import middleware
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateTransportRoute,
  validateObjectId,
  validatePagination,
  validateLocationSearch
} = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/search/location', validateLocationSearch, searchRoutesByLocation);

// Get transport statistics (Admin only) - Must be before /:id route
router.get('/stats', protect, authorize('Admin'), getTransportStats);

// Get transport routes - specific route to avoid conflict with /:id
router.get('/routes', optionalAuth, validatePagination, getTransportRoutes);

// Get transport schedules - specific route to avoid conflict with /:id
router.get('/schedules', optionalAuth, validatePagination, getTransportRoutes);

// Public routes with optional authentication
router.route('/')
  .get(optionalAuth, validatePagination, getTransportRoutes)
  .post(protect, authorize('Admin'), validateTransportRoute, createTransportRoute);

router.route('/:id')
  .get(optionalAuth, validateObjectId, getTransportRoute)
  .put(protect, authorize('Admin'), validateObjectId, updateTransportRoute)
  .delete(protect, authorize('Admin'), validateObjectId, deleteTransportRoute);

// Admin only routes
router.post('/:id/realtime', protect, authorize('Admin'), validateObjectId, updateRealTimeInfo);

module.exports = router; 