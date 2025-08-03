const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Vehicle Information
  make: {
    type: String,
    required: false
  },
  model: {
    type: String,
    required: false
  },
  year: {
    type: Number,
    required: false
  },
  color: {
    type: String,
    required: false
  },
  vehicleType: {
    type: String,
    enum: ['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle'],
    required: false
  },
  engineNumber: {
    type: String,
    required: false
  },
  chassisNumber: {
    type: String,
    required: false
  },
  registrationNumber: {
    type: String,
    sparse: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  applicationType: {
    type: String,
    required: true,
    enum: [
      'New Registration', 
      'Renewal', 
      'Service Change', 
      'Ownership Transfer', 
      'Name Change', 
      'Annual Inspection',
      'Service Type Change',
      'Lost Libri Replacement',
      'Lost Bolo Replacement',
      'Lost Plate Replacement'
    ]
  },
  documents: {
    identification: String,
    legalRepresentativeId: String,
    authorizationLetter: String,
    passportPhotos: String,
    importPermit: String,
    inspectionForm: String,
    notarizedDocuments: String,
    revenueClearance: String,
    validBolo: String,
    insuranceCertificate: String,
    insurancePolicy: String,
    salesAgreement: String,
    libri: String,
    policeReport: String,
    affidavit: String,
    powerOfAttorney: String,
    renewedId: String,
    officialLetter: String,
    damagedBolo: String,
    publicNotice: String,
    newspaperNotice: String,
    serviceFee: String
  },
  fees: {
    registrationFee: {
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
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    }
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  expiryDate: Date,
  notes: String,
  adminNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate registration number
vehicleSchema.methods.generateRegistrationNumber = function() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REG-${year}-${randomNum}`;
};

// Calculate total fees
vehicleSchema.pre('save', function(next) {
  if (this.fees && this.fees.registrationFee !== undefined && this.fees.penaltyFee !== undefined) {
    this.fees.totalFee = this.fees.registrationFee + this.fees.penaltyFee;
  }
  next();
});

// Index for better query performance
vehicleSchema.index({ user: 1, status: 1 });
vehicleSchema.index({ submissionDate: -1 });

// Create the Vehicle model
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle; 