const Transport = require('../models/Transport');
const { validationResult } = require('express-validator');

// @desc    Get all transport routes
// @route   GET /api/transport
// @access  Public
exports.getTransportRoutes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { 'operational.isActive': true };
    
    if (req.query.transportType) {
      filter.transportType = req.query.transportType;
    }
    
    if (req.query.search) {
      filter.$or = [
        { routeNumber: { $regex: req.query.search, $options: 'i' } },
        { routeName: { $regex: req.query.search, $options: 'i' } },
        { 'startLocation.name': { $regex: req.query.search, $options: 'i' } },
        { 'endLocation.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Location-based search (find routes near coordinates)
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseInt(req.query.radius) || 5000; // Default 5km radius

      filter.$or = [
        {
          'startLocation.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: radius
            }
          }
        },
        {
          'endLocation.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: radius
            }
          }
        },
        {
          'stops.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: radius
            }
          }
        }
      ];
    }

    const routes = await Transport.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ routeNumber: 1 });

    const total = await Transport.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      routes
    });
  } catch (error) {
    console.error('Get transport routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving transport routes'
    });
  }
};

// @desc    Get single transport route
// @route   GET /api/transport/:id
// @access  Public
exports.getTransportRoute = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    // Calculate additional route information
    const routeInfo = {
      ...route.toObject(),
      totalDistance: route.getTotalDistance(),
      estimatedTravelTime: route.getEstimatedTravelTime(),
      totalStops: route.stops.length
    };

    res.status(200).json({
      success: true,
      route: routeInfo
    });
  } catch (error) {
    console.error('Get transport route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving transport route'
    });
  }
};

// @desc    Create transport route (Admin only)
// @route   POST /api/transport
// @access  Private/Admin
exports.createTransportRoute = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add creator to the route data
    const routeData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Validate stops order
    if (routeData.stops && routeData.stops.length > 0) {
      routeData.stops.sort((a, b) => a.order - b.order);
      
      // Ensure order is sequential starting from 1
      routeData.stops.forEach((stop, index) => {
        stop.order = index + 1;
      });
    }

    const route = await Transport.create(routeData);

    await route.populate('createdBy', 'firstName lastName');

    console.log(`✅ New transport route created: ${route.routeNumber} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Transport route created successfully',
      route
    });
  } catch (error) {
    console.error('Create transport route error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Route number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating transport route',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update transport route (Admin only)
// @route   PUT /api/transport/:id
// @access  Private/Admin
exports.updateTransportRoute = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    // Add last updated by
    req.body.lastUpdatedBy = req.user.id;

    // Validate stops order if provided
    if (req.body.stops && req.body.stops.length > 0) {
      req.body.stops.sort((a, b) => a.order - b.order);
      
      // Ensure order is sequential starting from 1
      req.body.stops.forEach((stop, index) => {
        stop.order = index + 1;
      });
    }

    const updatedRoute = await Transport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy lastUpdatedBy', 'firstName lastName');

    console.log(`✅ Transport route updated: ${updatedRoute.routeNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Transport route updated successfully',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Update transport route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transport route'
    });
  }
};

// @desc    Delete transport route (Admin only)
// @route   DELETE /api/transport/:id
// @access  Private/Admin
exports.deleteTransportRoute = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    await Transport.findByIdAndDelete(req.params.id);

    console.log(`✅ Transport route deleted: ${route.routeNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Transport route deleted successfully'
    });
  } catch (error) {
    console.error('Delete transport route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting transport route'
    });
  }
};

// @desc    Add or update real-time information
// @route   POST /api/transport/:id/realtime
// @access  Private/Admin
exports.updateRealTimeInfo = async (req, res) => {
  try {
    const route = await Transport.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    const { currentLocation, delays, alerts } = req.body;

    // Update current location
    if (currentLocation) {
      route.realTime.currentLocation = {
        coordinates: currentLocation.coordinates,
        lastUpdated: new Date()
      };
    }

    // Add delays
    if (delays && Array.isArray(delays)) {
      delays.forEach(delay => {
        route.realTime.delays.push({
          reason: delay.reason,
          estimatedDelay: delay.estimatedDelay,
          reportedAt: new Date()
        });
      });
    }

    // Add alerts
    if (alerts && Array.isArray(alerts)) {
      alerts.forEach(alert => {
        route.realTime.alerts.push({
          message: alert.message,
          severity: alert.severity,
          startDate: alert.startDate || new Date(),
          endDate: alert.endDate,
          isActive: alert.isActive !== undefined ? alert.isActive : true
        });
      });
    }

    await route.save();

    console.log(`✅ Real-time info updated for route: ${route.routeNumber}`);

    res.status(200).json({
      success: true,
      message: 'Real-time information updated successfully',
      realTime: route.realTime
    });
  } catch (error) {
    console.error('Update real-time info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating real-time information'
    });
  }
};

// @desc    Get transport statistics (Admin only)
// @route   GET /api/transport/stats
// @access  Private/Admin
exports.getTransportStats = async (req, res) => {
  try {
    const typeStats = await Transport.aggregate([
      {
        $group: {
          _id: '$transportType',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$operational.capacity' },
          activeRoutes: {
            $sum: {
              $cond: [{ $eq: ['$operational.isActive', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalRoutes = await Transport.countDocuments();
    const activeRoutes = await Transport.countDocuments({ 'operational.isActive': true });
    const inactiveRoutes = await Transport.countDocuments({ 'operational.isActive': false });

    const averageRating = await Transport.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$statistics.averageRating' },
          totalRiders: { $sum: '$statistics.totalRiders' },
          totalReviews: { $sum: '$statistics.totalReviews' }
        }
      }
    ]);

    const accessibilityStats = await Transport.aggregate([
      {
        $group: {
          _id: null,
          wheelchairAccessible: {
            $sum: {
              $cond: [{ $eq: ['$operational.accessibility.wheelchairAccessible', true] }, 1, 0]
            }
          },
          audioAnnouncements: {
            $sum: {
              $cond: [{ $eq: ['$operational.accessibility.audioAnnouncements', true] }, 1, 0]
            }
          },
          visualDisplays: {
            $sum: {
              $cond: [{ $eq: ['$operational.accessibility.visualDisplays', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalRoutes,
        active: activeRoutes,
        inactive: inactiveRoutes,
        typeBreakdown: typeStats,
        performance: averageRating[0] || { avgRating: 0, totalRiders: 0, totalReviews: 0 },
        accessibility: accessibilityStats[0] || { wheelchairAccessible: 0, audioAnnouncements: 0, visualDisplays: 0 }
      }
    });
  } catch (error) {
    console.error('Get transport stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving transport statistics'
    });
  }
};

// @desc    Search routes by location
// @route   GET /api/transport/search/location
// @access  Public
exports.searchRoutesByLocation = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng, radius = 1000 } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        message: 'Start and end coordinates are required'
      });
    }

    const startLocation = [parseFloat(startLng), parseFloat(startLat)];
    const endLocation = [parseFloat(endLng), parseFloat(endLat)];
    const searchRadius = parseInt(radius);

    // Find routes that have stops near both start and end locations
    const routes = await Transport.find({
      'operational.isActive': true,
      $and: [
        {
          $or: [
            {
              'startLocation.coordinates': {
                $near: {
                  $geometry: { type: 'Point', coordinates: startLocation },
                  $maxDistance: searchRadius
                }
              }
            },
            {
              'stops.coordinates': {
                $near: {
                  $geometry: { type: 'Point', coordinates: startLocation },
                  $maxDistance: searchRadius
                }
              }
            }
          ]
        },
        {
          $or: [
            {
              'endLocation.coordinates': {
                $near: {
                  $geometry: { type: 'Point', coordinates: endLocation },
                  $maxDistance: searchRadius
                }
              }
            },
            {
              'stops.coordinates': {
                $near: {
                  $geometry: { type: 'Point', coordinates: endLocation },
                  $maxDistance: searchRadius
                }
              }
            }
          ]
        }
      ]
    }).limit(10);

    res.status(200).json({
      success: true,
      count: routes.length,
      routes: routes.map(route => ({
        _id: route._id,
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        transportType: route.transportType,
        startLocation: route.startLocation,
        endLocation: route.endLocation,
        pricing: route.pricing,
        operatingHours: route.operational.operatingHours,
        totalDistance: route.getTotalDistance(),
        estimatedTravelTime: route.getEstimatedTravelTime()
      }))
    });
  } catch (error) {
    console.error('Search routes by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching routes'
    });
  }
}; 