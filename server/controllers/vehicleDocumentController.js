const VehicleDocument = require('../models/VehicleDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/vehicle-documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only pdf, jpg, jpeg, png
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'documents[notarizedDocuments]', maxCount: 1 },
  { name: 'documents[revenueClearance]', maxCount: 1 },
  { name: 'documents[passportPhotos]', maxCount: 1 },
  { name: 'documents[validBolo]', maxCount: 1 },
  { name: 'documents[insuranceCertificate]', maxCount: 1 }
]);

// Handle file upload
exports.uploadDocuments = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        // An unknown error occurred
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      try {
        // Process the uploaded files
        const documents = {};
        if (req.files) {
          Object.keys(req.files).forEach(key => {
            const file = req.files[key][0];
            const fieldName = key.replace('documents[', '').replace(']', '');
            documents[fieldName] = {
              url: `/uploads/vehicle-documents/${file.filename}`,
              filename: file.filename,
              mimetype: file.mimetype
            };
          });
        }

        // Create new vehicle document record
        const vehicleDocument = new VehicleDocument({
          userId: req.user._id, // Assuming you have user info in req.user
          applicationType: req.body.applicationType,
          documents: documents,
          submissionDate: new Date()
        });

        await vehicleDocument.save();

        res.status(201).json({
          success: true,
          message: 'Documents uploaded successfully',
          data: vehicleDocument
        });
      } catch (error) {
        console.error('Error saving document:', error);
        res.status(500).json({
          success: false,
          message: 'Error saving document information'
        });
      }
    });
  } catch (error) {
    console.error('Error in uploadDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading documents'
    });
  }
};

// Get user's documents
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await VehicleDocument.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
};

// Get single document
exports.getDocument = async (req, res) => {
  try {
    const document = await VehicleDocument.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document'
    });
  }
}; 