const mongoose = require('mongoose')

const landProcessSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationType: {
    type: String,
    enum: ['Transfer Land', 'Building Permission', 'Add New Land'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },

  // Land Information
  ownerName: {
    type: String,
    required: true
  },
  landLocation: {
    type: String,
    required: true
  },
  landType: {
    type: String,
    required: true,
    enum: ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed']
  },

  // Additional fields for Building Permission
  buildingPurpose: {
    type: String
  },
  buildingSize: {
    type: String
  },
  estimatedCost: {
    type: String
  },

  // Document paths
  documents: {
    landTitleDeed: {
      type: String
    },
    surveyPlan: {
      type: String
    },
    identificationDocument: {
      type: String
    },
    // Additional documents for Building Permission
    buildingPlan: {
      type: String
    },
    engineeringReport: {
      type: String
    },
    environmentalAssessment: {
      type: String
    }
  },

  // Additional data stored as JSON
  additionalData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Indexes for better query performance
landProcessSchema.index({ userId: 1, status: 1 })
landProcessSchema.index({ applicationType: 1, status: 1 })
landProcessSchema.index({ submissionDate: -1 })

module.exports = mongoose.model('LandProcess', landProcessSchema) 