const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// @desc    Submit vehicle registration application
// @route   POST /api/vehicles
// @access  Private
exports.createVehicleApplication = async (req, res) => {
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

    // Add user to the application
    const vehicleData = {
      ...req.body,
      user: req.user.id
    };

    // Set fees based on application type
    switch (vehicleData.applicationType) {
      case 'New Registration':
        vehicleData.fees = {
          registrationFee: 500,
          penaltyFee: 0,
          paymentStatus: 'Pending'
        };
        break;
      case 'Transfer':
        vehicleData.fees = {
          registrationFee: 200,
          penaltyFee: 0,
          paymentStatus: 'Pending'
        };
        break;
      case 'Renewal':
        vehicleData.fees = {
          registrationFee: 300,
          penaltyFee: 0,
          paymentStatus: 'Pending'
        };
        break;
      case 'Replacement':
        vehicleData.fees = {
          registrationFee: 150,
          penaltyFee: 0,
          paymentStatus: 'Pending'
        };
        break;
      default:
        vehicleData.fees = {
          registrationFee: 500,
          penaltyFee: 0,
          paymentStatus: 'Pending'
        };
    }

    const vehicle = await Vehicle.create(vehicleData);

    // Populate user information
    await vehicle.populate('user', 'firstName lastName email phone');

    console.log(`✅ New vehicle application submitted: ${vehicle._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Vehicle registration application submitted successfully',
      vehicle
    });
  } catch (error) {
    console.error('Create vehicle application error:', error);
    console.error('Error details:', {
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      message: error.message
    });
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists in our system`,
        details: {
          field,
          value: error.keyValue[field]
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating vehicle application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get vehicle applications
// @route   GET /api/vehicles
// @access  Private
exports.getVehicleApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = {};
    
    if (req.user.role === 'Public') {
      // Public users can only see their own applications
      filter.user = req.user.id;
    } else if (req.user.role === 'Admin') {
      // Admins can see all applications
      if (req.query.userId) {
        filter.user = req.query.userId;
      }
    }

    // Additional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.applicationType) {
      filter.applicationType = req.query.applicationType;
    }
    if (req.query.vehicleType) {
      filter.vehicleType = req.query.vehicleType;
    }
    if (req.query.search) {
      filter.$or = [
        { make: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } },
        { registrationNumber: { $regex: req.query.search, $options: 'i' } },
        { engineNumber: { $regex: req.query.search, $options: 'i' } },
        { chassisNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .populate('user', 'firstName lastName email phone nationalId')
      .populate('adminNotes.addedBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ submissionDate: -1 });

    const total = await Vehicle.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      vehicles
    });
  } catch (error) {
    console.error('Get vehicle applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle applications'
    });
  }
};

// @desc    Get single vehicle application
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicleApplication = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('user', 'firstName lastName email phone nationalId address')
      .populate('adminNotes.addedBy', 'firstName lastName email');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle application not found'
      });
    }

    // Check if user owns the application or is admin
    if (req.user.role === 'Public' && vehicle.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this vehicle application'
      });
    }

    res.status(200).json({
      success: true,
      vehicle
    });
  } catch (error) {
    console.error('Get vehicle application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle application'
    });
  }
};

// @desc    Update vehicle application (User can update if pending, Admin can update always)
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicleApplication = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle application not found'
      });
    }

    // Check permissions
    if (req.user.role === 'Public') {
      // Public users can only update their own pending applications
      if (vehicle.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this vehicle application'
        });
      }
      if (vehicle.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update application after it has been reviewed'
        });
      }
    }

    // If admin is updating status, add review date
    if (req.user.role === 'Admin' && req.body.status && req.body.status !== vehicle.status) {
      req.body.reviewDate = new Date();
      
      // If approved, generate registration number
      if (req.body.status === 'Approved' && !vehicle.registrationNumber) {
        req.body.registrationNumber = vehicle.generateRegistrationNumber();
      }
      
      // If completed, set completion date
      if (req.body.status === 'Completed') {
        req.body.completionDate = new Date();
      }

      // If admin note is provided, add it to admin notes
      if (req.body.adminNote) {
        const newNote = {
          note: req.body.adminNote,
          addedBy: req.user.id,
          addedAt: new Date()
        };
        
        if (!vehicle.adminNotes) {
          vehicle.adminNotes = [];
        }
        vehicle.adminNotes.push(newNote);
      }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'firstName lastName email phone nationalId');

    console.log(`✅ Vehicle application updated: ${updatedVehicle._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Vehicle application updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle application'
    });
  }
};

// @desc    Add admin note to vehicle application
// @route   POST /api/vehicles/:id/notes
// @access  Private/Admin
exports.addAdminNote = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle application not found'
      });
    }

    const newNote = {
      note: req.body.note,
      addedBy: req.user.id,
      addedAt: new Date()
    };

    vehicle.adminNotes.push(newNote);
    await vehicle.save();

    await vehicle.populate('adminNotes.addedBy', 'firstName lastName email');

    console.log(`✅ Admin note added to vehicle application: ${vehicle._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin note added successfully',
      vehicle
    });
  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding admin note'
    });
  }
};

// @desc    Delete vehicle application
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicleApplication = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle application not found'
      });
    }

    // Check permissions
    if (req.user.role === 'Public') {
      // Public users can only delete their own pending applications
      if (vehicle.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this vehicle application'
        });
      }
      if (vehicle.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete application after it has been reviewed'
        });
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    console.log(`✅ Vehicle application deleted: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Vehicle application deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vehicle application'
    });
  }
};

// @desc    Get vehicle statistics (Admin only)
// @route   GET /api/vehicles/stats
// @access  Private/Admin
exports.getVehicleStats = async (req, res) => {
  try {
    const stats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationTypeStats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$applicationType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Vehicle.countDocuments();
    const pendingApplications = await Vehicle.countDocuments({ status: 'Pending' });
    const approvedApplications = await Vehicle.countDocuments({ status: 'Approved' });
    const rejectedApplications = await Vehicle.countDocuments({ status: 'Rejected' });

    const totalRevenue = await Vehicle.aggregate([
      {
        $match: { 'fees.paymentStatus': 'Paid' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fees.totalFee' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        revenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats,
        vehicleTypeBreakdown: typeStats,
        applicationTypeBreakdown: applicationTypeStats
      }
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle statistics'
    });
  }
};

// Helper function to save uploaded file
const saveFile = async (file, folder) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);
  
  await fs.promises.writeFile(filePath, file.buffer);
  return path.join(folder, fileName);
};

// @desc    Register new vehicle with file uploads
// @route   POST /api/vehicles/register
// @access  Private
exports.registerVehicle = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/vehicles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save uploaded files
    const documents = {};
    for (const [fieldName, files] of Object.entries(req.files)) {
      const file = files[0];
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.promises.writeFile(filePath, file.buffer);
      documents[fieldName] = `/uploads/vehicles/${fileName}`;
    }

    // Create vehicle data object
    const vehicleData = {
      user: req.user.id,
      applicationType: req.body.applicationType || 'New Registration',
      documents,
      status: 'Pending',
      fees: {
        registrationFee: 500,
        penaltyFee: 0,
        paymentStatus: 'Pending'
      },
      submissionDate: new Date()
    };

    // Only add vehicle information if provided (for New Registration, Renewal, etc.)
    // Skip vehicle info for Annual Inspection and other document-only applications
    if (req.body.applicationType !== 'Annual Inspection' && 
        req.body.applicationType !== 'Service Type Change' &&
        req.body.applicationType !== 'Lost Libri Replacement' &&
        req.body.applicationType !== 'Lost Bolo Replacement' &&
        req.body.applicationType !== 'Lost Plate Replacement') {
      
      if (req.body.make) vehicleData.make = req.body.make;
      if (req.body.model) vehicleData.model = req.body.model;
      if (req.body.year) vehicleData.year = parseInt(req.body.year);
      if (req.body.color) vehicleData.color = req.body.color;
      if (req.body.vehicleType) vehicleData.vehicleType = req.body.vehicleType;
      
      // Only set engineNumber and chassisNumber if they are provided and not empty
      if (req.body.engineNumber && req.body.engineNumber.trim() !== '') {
        vehicleData.engineNumber = req.body.engineNumber.trim();
      }
      if (req.body.chassisNumber && req.body.chassisNumber.trim() !== '') {
        vehicleData.chassisNumber = req.body.chassisNumber.trim();
      }
    }

    // Check for existing vehicle with same engine or chassis number (only if provided)
    // Skip this check for document-only applications
    if (req.body.applicationType !== 'Annual Inspection' && 
        req.body.applicationType !== 'Service Type Change' &&
        req.body.applicationType !== 'Lost Libri Replacement' &&
        req.body.applicationType !== 'Lost Bolo Replacement' &&
        req.body.applicationType !== 'Lost Plate Replacement' &&
        (vehicleData.engineNumber || vehicleData.chassisNumber)) {
      
      const existingVehicle = await Vehicle.findOne({
        $or: [
          ...(vehicleData.engineNumber ? [{ engineNumber: vehicleData.engineNumber }] : []),
          ...(vehicleData.chassisNumber ? [{ chassisNumber: vehicleData.chassisNumber }] : [])
        ]
      });

      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'A vehicle with this engine number or chassis number already exists'
        });
      }
    }

    // Create new vehicle
    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      vehicle
    });
  } catch (error) {
    console.error('Register vehicle error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error registering vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's vehicles
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
};

// Get single vehicle
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!vehicle) {
      return res.status(404).json({
        message: 'Vehicle not found'
      });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
}; 