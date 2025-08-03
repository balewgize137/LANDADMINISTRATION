const mongoose = require('mongoose');

const vehicleDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationType: {
    type: String,
    required: true,
    enum: ['Annual Inspection Name Change', 'New Registration', 'Service Type Change', 'Ownership Transfer']
  },
  documents: {
    notarizedDocuments: {
      url: String,
      filename: String,
      mimetype: String
    },
    revenueClearance: {
      url: String,
      filename: String,
      mimetype: String
    },
    passportPhotos: {
      url: String,
      filename: String,
      mimetype: String
    },
    validBolo: {
      url: String,
      filename: String,
      mimetype: String
    },
    insuranceCertificate: {
      url: String,
      filename: String,
      mimetype: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: Date,
  reviewNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('VehicleDocument', vehicleDocumentSchema); 