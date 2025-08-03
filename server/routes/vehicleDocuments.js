const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  uploadDocuments,
  getUserDocuments,
  getDocument
} = require('../controllers/vehicleDocumentController');

// Upload documents
router.post('/annual-inspection', protect, uploadDocuments);

// Get user's documents
router.get('/my-documents', protect, getUserDocuments);

// Get single document
router.get('/:id', protect, getDocument);

module.exports = router; 