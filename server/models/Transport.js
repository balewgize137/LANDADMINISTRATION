const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  // Route Information
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    trim: true
  },
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  transportType: {
    type: String,
    required: [true, 'Transport type is required'],
    enum: ['Bus', 'Metro', 'Train', 'Tram', 'Ferry']
  },
  // Route Details
  startLocation: {
    name: {
      type: String,
      required: [true, 'Start location name is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Start location latitude is required']
      },
      longitude: {
        type: Number,
        required: [true, 'Start location longitude is required']
      }
    },
    address: String
  },
  endLocation: {
    name: {
      type: String,
      required: [true, 'End location name is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'End location latitude is required']
      },
      longitude: {
        type: Number,
        required: [true, 'End location longitude is required']
      }
    },
    address: String
  },
  // Stops/Stations
  stops: [{
    name: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    address: String,
    order: {
      type: Number,
      required: true
    },
    facilities: [{
      type: String,
      enum: ['WiFi', 'Restroom', 'Parking', 'ATM', 'Food Court', 'Shelter', 'Wheelchair Access']
    }],
    estimatedTravelTime: Number // in minutes from previous stop
  }],
  // Schedule Information
  schedule: {
    weekdays: [{
      departureTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      },
      frequency: Number, // in minutes
      lastDeparture: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      }
    }],
    weekends: [{
      departureTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      },
      frequency: Number, // in minutes
      lastDeparture: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      }
    }],
    holidays: [{
      date: Date,
      schedule: [{
        departureTime: String,
        frequency: Number,
        lastDeparture: String
      }]
    }]
  },
  // Pricing Information
  pricing: {
    baseFare: {
      type: Number,
      required: [true, 'Base fare is required'],
      min: [0, 'Base fare cannot be negative']
    },
    currency: {
      type: String,
      default: 'SAR'
    },
    zoneBasedPricing: [{
      zones: Number,
      fare: Number
    }],
    discounts: [{
      type: {
        type: String,
        enum: ['Student', 'Senior', 'Disabled', 'Child', 'Monthly Pass', 'Annual Pass']
      },
      percentage: Number,
      fixedAmount: Number
    }]
  },
  // Operational Information
  operational: {
    isActive: {
      type: Boolean,
      default: true
    },
    capacity: {
      type: Number,
      required: [true, 'Vehicle capacity is required']
    },
    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false
      },
      audioAnnouncements: {
        type: Boolean,
        default: false
      },
      visualDisplays: {
        type: Boolean,
        default: false
      }
    },
    operatingHours: {
      start: {
        type: String,
        required: [true, 'Operating start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      },
      end: {
        type: String,
        required: [true, 'Operating end time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      }
    }
  },
  // Real-time Information
  realTime: {
    currentLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      lastUpdated: Date
    },
    delays: [{
      reason: String,
      estimatedDelay: Number, // in minutes
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }],
    alerts: [{
      message: String,
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical']
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  // Additional Information
  description: String,
  images: [{
    url: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Admin Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Statistics
  statistics: {
    totalRiders: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Calculate distance between two coordinates (Haversine formula)
transportSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get total route distance
transportSchema.methods.getTotalDistance = function() {
  let totalDistance = 0;
  const stops = this.stops.sort((a, b) => a.order - b.order);
  
  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];
    totalDistance += this.calculateDistance(
      current.coordinates.latitude,
      current.coordinates.longitude,
      next.coordinates.latitude,
      next.coordinates.longitude
    );
  }
  
  return totalDistance;
};

// Get estimated total travel time
transportSchema.methods.getEstimatedTravelTime = function() {
  return this.stops.reduce((total, stop) => total + (stop.estimatedTravelTime || 0), 0);
};

// Index for better query performance
transportSchema.index({ routeNumber: 1 });
transportSchema.index({ transportType: 1 });
transportSchema.index({ 'operational.isActive': 1 });
transportSchema.index({ 'startLocation.coordinates': '2dsphere' });
transportSchema.index({ 'endLocation.coordinates': '2dsphere' });
transportSchema.index({ 'stops.coordinates': '2dsphere' });

module.exports = mongoose.model('Transport', transportSchema); 