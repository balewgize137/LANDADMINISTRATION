const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import controllers
const {
  createVehicleApplication,
  getVehicleApplications,
  getVehicleApplication,
  updateVehicleApplication,
  addAdminNote,
  deleteVehicleApplication,
  getVehicleStats,
  registerVehicle,
  getUserVehicles,
  getVehicle
} = require('../controllers/vehicleController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const {
  validateVehicleRegistration,
  validateObjectId,
  validatePagination,
  validateAdminNote
} = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only pdf, jpg, jpeg, png
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
    }
  }
});

// Get vehicle statistics (Admin only) - Must be before /:id route
router.get('/stats', protect, authorize('Admin'), getVehicleStats);

// Get user's vehicles - Must be before /:id route
router.get('/my-vehicles', protect, getUserVehicles);

// Public user and admin routes
router.route('/')
  .get(protect, validatePagination, getVehicleApplications)
  .post(protect, validateVehicleRegistration, createVehicleApplication);

router.route('/:id')
  .get(protect, validateObjectId, getVehicleApplication)
  .put(protect, validateObjectId, updateVehicleApplication)
  .delete(protect, validateObjectId, deleteVehicleApplication);

// Admin only routes
router.post('/:id/notes', protect, authorize('Admin'), validateObjectId, validateAdminNote, addAdminNote);

// Register new vehicle with file uploads
router.post('/register',
  protect,
  upload.fields([
    { name: 'identification', maxCount: 1 },
    { name: 'legalRepresentativeId', maxCount: 1 },
    { name: 'authorizationLetter', maxCount: 1 },
    { name: 'passportPhotos', maxCount: 1 },
    { name: 'importPermit', maxCount: 1 },
    { name: 'inspectionForm', maxCount: 1 },
    { name: 'notarizedDocuments', maxCount: 1 },
    { name: 'revenueClearance', maxCount: 1 },
    { name: 'validBolo', maxCount: 1 },
    { name: 'insuranceCertificate', maxCount: 1 },
    { name: 'insurancePolicy', maxCount: 1 },
    { name: 'salesAgreement', maxCount: 1 },
    { name: 'libri', maxCount: 1 },
    { name: 'policeReport', maxCount: 1 },
    { name: 'affidavit', maxCount: 1 },
    { name: 'powerOfAttorney', maxCount: 1 },
    { name: 'renewedId', maxCount: 1 },
    { name: 'officialLetter', maxCount: 1 },
    { name: 'damagedBolo', maxCount: 1 },
    { name: 'publicNotice', maxCount: 1 },
    { name: 'newspaperNotice', maxCount: 1 },
    { name: 'serviceFee', maxCount: 1 }
  ]),
  registerVehicle
);

module.exports = router; 