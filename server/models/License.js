const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Application Details
  applicationType: {
    type: String,
    required: true,
    enum: ['New License', 'Renewal', 'Replacement', 'Upgrade', 'International']
  },
  licenseType: {
    type: String,
    required: [true, 'License type is required'],
    enum: ['Private', 'Commercial', 'Motorcycle', 'Heavy Vehicle', 'Public Transport', 'Taxi']
  },
  licenseClass: {
    type: String,
    required: [true, 'License class is required'],
    enum: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6']
  },
  // Current License Information (for renewals/upgrades)
  currentLicense: {
    number: String,
    expiryDate: Date,
    issuingAuthority: String,
    restrictions: [String]
  },
  // Personal Information
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    }
  },
  // Medical Information
  medicalInfo: {
    hasVisionProblems: {
      type: Boolean,
      default: false
    },
    wearsGlasses: {
      type: Boolean,
      default: false
    },
    hasHearingProblems: {
      type: Boolean,
      default: false
    },
    hasMedicalConditions: {
      type: Boolean,
      default: false
    },
    medicalConditions: [String],
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    organDonor: {
      type: Boolean,
      default: false
    }
  },
  // Test Information
  tests: {
    theory: {
      required: {
        type: Boolean,
        default: true
      },
      scheduled: Date,
      completed: Date,
      result: {
        type: String,
        enum: ['Pending', 'Pass', 'Fail']
      },
      score: Number,
      attempts: {
        type: Number,
        default: 0
      }
    },
    practical: {
      required: {
        type: Boolean,
        default: true
      },
      scheduled: Date,
      completed: Date,
      result: {
        type: String,
        enum: ['Pending', 'Pass', 'Fail']
      },
      score: Number,
      attempts: {
        type: Number,
        default: 0
      },
      instructor: String
    },
    medical: {
      required: {
        type: Boolean,
        default: true
      },
      scheduled: Date,
      completed: Date,
      result: {
        type: String,
        enum: ['Pending', 'Pass', 'Fail']
      },
      notes: String
    }
  },
  // Application Status
  status: {
    type: String,
    default: 'Pending',
    enum: [
      'Pending',
      'Documents Review',
      'Tests Scheduled',
      'Tests In Progress',
      'Medical Examination',
      'Final Review',
      'Approved',
      'Rejected',
      'License Issued'
    ]
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: Date,
  approvalDate: Date,
  issueDate: Date,
  // Documents
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'National ID',
        'Passport Photo',
        'Medical Certificate',
        'Vision Test',
        'Training Certificate',
        'Previous License',
        'Other'
      ]
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  // License Details (when issued)
  licenseDetails: {
    licenseNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    issueDate: Date,
    expiryDate: Date,
    restrictions: [String],
    endorsements: [String]
  },
  // Fees
  fees: {
    applicationFee: {
      type: Number,
      default: 0
    },
    testFee: {
      type: Number,
      default: 0
    },
    licenseFee: {
      type: Number,
      default: 0
    },
    penaltyFee: {
      type: Number,
      default: 0
    },
    totalFee: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Paid', 'Waived']
    },
    paymentDate: Date
  },
  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate license number
licenseSchema.methods.generateLicenseNumber = function() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `DL-${year}-${randomNum}`;
};

// Calculate total fees
licenseSchema.pre('save', function(next) {
  const fees = this.fees;
  if (fees.applicationFee !== undefined && fees.testFee !== undefined && 
      fees.licenseFee !== undefined && fees.penaltyFee !== undefined) {
    this.fees.totalFee = fees.applicationFee + fees.testFee + fees.licenseFee + fees.penaltyFee;
  }
  next();
});

// Check if all tests are passed
licenseSchema.methods.areAllTestsPassed = function() {
  const tests = this.tests;
  const theoryPassed = !tests.theory.required || tests.theory.result === 'Pass';
  const practicalPassed = !tests.practical.required || tests.practical.result === 'Pass';
  const medicalPassed = !tests.medical.required || tests.medical.result === 'Pass';
  
  return theoryPassed && practicalPassed && medicalPassed;
};

// Index for better query performance
licenseSchema.index({ user: 1, status: 1 });
licenseSchema.index({ licenseNumber: 1 });
licenseSchema.index({ submissionDate: -1 });
licenseSchema.index({ 'licenseDetails.expiryDate': 1 });

module.exports = mongoose.model('License', licenseSchema); 