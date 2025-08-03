const License = require('../models/License');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Submit driver's license application
// @route   POST /api/licenses
// @access  Private
exports.createLicenseApplication = async (req, res) => {
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
    const licenseData = {
      ...req.body,
      user: req.user.id
    };

    // Set fees based on application type and license type
    const baseFees = {
      'New License': { applicationFee: 100, testFee: 200, licenseFee: 300 },
      'Renewal': { applicationFee: 50, testFee: 0, licenseFee: 200 },
      'Replacement': { applicationFee: 30, testFee: 0, licenseFee: 100 },
      'Upgrade': { applicationFee: 80, testFee: 150, licenseFee: 250 },
      'International': { applicationFee: 150, testFee: 0, licenseFee: 400 }
    };

    const fees = baseFees[licenseData.applicationType] || baseFees['New License'];
    
    licenseData.fees = {
      ...fees,
      penaltyFee: 0,
      paymentStatus: 'Pending'
    };

    // Set test requirements based on application type
    if (licenseData.applicationType === 'New License' || licenseData.applicationType === 'Upgrade') {
      licenseData.tests = {
        theory: { required: true, result: 'Pending' },
        practical: { required: true, result: 'Pending' },
        medical: { required: true, result: 'Pending' }
      };
    } else if (licenseData.applicationType === 'Renewal') {
      licenseData.tests = {
        theory: { required: false, result: 'Pass' },
        practical: { required: false, result: 'Pass' },
        medical: { required: true, result: 'Pending' }
      };
    } else {
      licenseData.tests = {
        theory: { required: false, result: 'Pass' },
        practical: { required: false, result: 'Pass' },
        medical: { required: false, result: 'Pass' }
      };
    }

    const license = await License.create(licenseData);

    // Populate user information
    await license.populate('user', 'firstName lastName email phone');

    console.log(`✅ New license application submitted: ${license._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Driver\'s license application submitted successfully',
      license
    });
  } catch (error) {
    console.error('Create license application error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error creating license application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get license applications
// @route   GET /api/licenses
// @access  Private
exports.getLicenseApplications = async (req, res) => {
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
    if (req.query.licenseType) {
      filter.licenseType = req.query.licenseType;
    }
    if (req.query.search) {
      filter.$or = [
        { 'licenseDetails.licenseNumber': { $regex: req.query.search, $options: 'i' } },
        { licenseType: { $regex: req.query.search, $options: 'i' } },
        { licenseClass: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const licenses = await License.find(filter)
      .populate('user', 'firstName lastName email phone nationalId')
      .populate('adminNotes.addedBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ submissionDate: -1 });

    const total = await License.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: licenses.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      licenses
    });
  } catch (error) {
    console.error('Get license applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving license applications'
    });
  }
};

// @desc    Get single license application
// @route   GET /api/licenses/:id
// @access  Private
exports.getLicenseApplication = async (req, res) => {
  try {
    const license = await License.findById(req.params.id)
      .populate('user', 'firstName lastName email phone nationalId address dateOfBirth')
      .populate('adminNotes.addedBy', 'firstName lastName email');

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    // Check if user owns the application or is admin
    if (req.user.role === 'Public' && license.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this license application'
      });
    }

    res.status(200).json({
      success: true,
      license
    });
  } catch (error) {
    console.error('Get license application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving license application'
    });
  }
};

// @desc    Update license application
// @route   PUT /api/licenses/:id
// @access  Private
exports.updateLicenseApplication = async (req, res) => {
  try {
    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    // Check permissions
    if (req.user.role === 'Public') {
      // Public users can only update their own pending applications
      if (license.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this license application'
        });
      }
      if (license.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update application after it has been reviewed'
        });
      }
    }

    // If admin is updating status
    if (req.user.role === 'Admin' && req.body.status && req.body.status !== license.status) {
      req.body.reviewDate = new Date();
      
      // If approved and all tests passed, generate license number
      if (req.body.status === 'Approved' && license.areAllTestsPassed() && !license.licenseDetails?.licenseNumber) {
        if (!req.body.licenseDetails) req.body.licenseDetails = {};
        req.body.licenseDetails.licenseNumber = license.generateLicenseNumber();
        req.body.licenseDetails.issueDate = new Date();
        req.body.licenseDetails.expiryDate = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
        req.body.approvalDate = new Date();
      }
      
      // If license issued
      if (req.body.status === 'License Issued') {
        req.body.issueDate = new Date();
      }
    }

    const updatedLicense = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'firstName lastName email phone nationalId');

    console.log(`✅ License application updated: ${updatedLicense._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'License application updated successfully',
      license: updatedLicense
    });
  } catch (error) {
    console.error('Update license application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating license application'
    });
  }
};

// @desc    Schedule test for license application
// @route   POST /api/licenses/:id/tests/:testType/schedule
// @access  Private/Admin
exports.scheduleTest = async (req, res) => {
  try {
    const { testType } = req.params;
    const { scheduledDate, instructor } = req.body;

    if (!['theory', 'practical', 'medical'].includes(testType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test type'
      });
    }

    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    if (!license.tests[testType].required) {
      return res.status(400).json({
        success: false,
        message: `${testType} test is not required for this application`
      });
    }

    // Update test schedule
    license.tests[testType].scheduled = new Date(scheduledDate);
    if (testType === 'practical' && instructor) {
      license.tests[testType].instructor = instructor;
    }

    // Update application status if appropriate
    if (license.status === 'Pending') {
      license.status = 'Tests Scheduled';
    }

    await license.save();

    console.log(`✅ ${testType} test scheduled for license application: ${license._id}`);

    res.status(200).json({
      success: true,
      message: `${testType} test scheduled successfully`,
      license
    });
  } catch (error) {
    console.error('Schedule test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scheduling test'
    });
  }
};

// @desc    Record test result
// @route   POST /api/licenses/:id/tests/:testType/result
// @access  Private/Admin
exports.recordTestResult = async (req, res) => {
  try {
    const { testType } = req.params;
    const { result, score, notes } = req.body;

    if (!['theory', 'practical', 'medical'].includes(testType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test type'
      });
    }

    if (!['Pass', 'Fail'].includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test result. Must be Pass or Fail'
      });
    }

    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    // Update test result
    license.tests[testType].result = result;
    license.tests[testType].completed = new Date();
    license.tests[testType].attempts += 1;
    
    if (score !== undefined) {
      license.tests[testType].score = score;
    }
    
    if (testType === 'medical' && notes) {
      license.tests[testType].notes = notes;
    }

    // Update application status based on test results
    if (license.areAllTestsPassed()) {
      license.status = 'Final Review';
    } else if (result === 'Fail') {
      license.status = 'Tests In Progress';
    }

    await license.save();

    console.log(`✅ ${testType} test result recorded for license application: ${license._id} - ${result}`);

    res.status(200).json({
      success: true,
      message: `${testType} test result recorded successfully`,
      license
    });
  } catch (error) {
    console.error('Record test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording test result'
    });
  }
};

// @desc    Add admin note to license application
// @route   POST /api/licenses/:id/notes
// @access  Private/Admin
exports.addAdminNote = async (req, res) => {
  try {
    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    const newNote = {
      note: req.body.note,
      addedBy: req.user.id,
      addedAt: new Date()
    };

    license.adminNotes.push(newNote);
    await license.save();

    await license.populate('adminNotes.addedBy', 'firstName lastName email');

    console.log(`✅ Admin note added to license application: ${license._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin note added successfully',
      license
    });
  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding admin note'
    });
  }
};

// @desc    Delete license application
// @route   DELETE /api/licenses/:id
// @access  Private
exports.deleteLicenseApplication = async (req, res) => {
  try {
    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    // Check permissions
    if (req.user.role === 'Public') {
      // Public users can only delete their own pending applications
      if (license.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this license application'
        });
      }
      if (license.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete application after it has been reviewed'
        });
      }
    }

    await License.findByIdAndDelete(req.params.id);

    console.log(`✅ License application deleted: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'License application deleted successfully'
    });
  } catch (error) {
    console.error('Delete license application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting license application'
    });
  }
};

// @desc    Get license statistics (Admin only)
// @route   GET /api/licenses/stats
// @access  Private/Admin
exports.getLicenseStats = async (req, res) => {
  try {
    const stats = await License.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await License.aggregate([
      {
        $group: {
          _id: '$licenseType',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationTypeStats = await License.aggregate([
      {
        $group: {
          _id: '$applicationType',
          count: { $sum: 1 }
        }
      }
    ]);

    const testStats = await License.aggregate([
      {
        $group: {
          _id: null,
          theoryPass: {
            $sum: {
              $cond: [{ $eq: ['$tests.theory.result', 'Pass'] }, 1, 0]
            }
          },
          practicalPass: {
            $sum: {
              $cond: [{ $eq: ['$tests.practical.result', 'Pass'] }, 1, 0]
            }
          },
          medicalPass: {
            $sum: {
              $cond: [{ $eq: ['$tests.medical.result', 'Pass'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalApplications = await License.countDocuments();
    const pendingApplications = await License.countDocuments({ status: 'Pending' });
    const approvedApplications = await License.countDocuments({ status: 'Approved' });
    const rejectedApplications = await License.countDocuments({ status: 'Rejected' });
    const issuedLicenses = await License.countDocuments({ status: 'License Issued' });

    const totalRevenue = await License.aggregate([
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
        issued: issuedLicenses,
        revenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats,
        licenseTypeBreakdown: typeStats,
        applicationTypeBreakdown: applicationTypeStats,
        testStats: testStats[0] || { theoryPass: 0, practicalPass: 0, medicalPass: 0 }
      }
    });
  } catch (error) {
    console.error('Get license stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving license statistics'
    });
  }
};

// @desc    Update license application
// @route   PUT /api/licenses/:id
// @access  Private
exports.updateLicenseApplication = async (req, res) => {
  try {
    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License application not found'
      });
    }

    // Check permissions
    if (req.user.role === 'Public') {
      // Public users can only update their own pending applications
      if (license.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this license application'
        });
      }
      if (license.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update application after it has been reviewed'
        });
      }
    }

    // If admin is updating status
    if (req.user.role === 'Admin' && req.body.status && req.body.status !== license.status) {
      req.body.reviewDate = new Date();
      
      // If approved and all tests passed, generate license number
      if (req.body.status === 'Approved' && license.areAllTestsPassed() && !license.licenseDetails?.licenseNumber) {
        if (!req.body.licenseDetails) req.body.licenseDetails = {};
        req.body.licenseDetails.licenseNumber = license.generateLicenseNumber();
        req.body.licenseDetails.issueDate = new Date();
        req.body.licenseDetails.expiryDate = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
        req.body.approvalDate = new Date();
      }
      
      // If license issued
      if (req.body.status === 'License Issued') {
        req.body.issueDate = new Date();
      }
    }

    const updatedLicense = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'firstName lastName email phone nationalId');

    console.log(`✅ License application updated: ${updatedLicense._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'License application updated successfully',
      license: updatedLicense
    });
  } catch (error) {
    console.error('Update license application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating license application'
    });
  }
};

// @desc    Get license statistics (Admin only)
// @route   GET /api/licenses/stats
// @access  Private/Admin
exports.getLicenseStats = async (req, res) => {
  try {
    const stats = await License.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await License.countDocuments();
    const pendingApplications = await License.countDocuments({ status: 'Pending' });
    const approvedApplications = await License.countDocuments({ status: 'Approved' });
    const rejectedApplications = await License.countDocuments({ status: 'Rejected' });

    res.status(200).json({
      success: true,
      stats: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Get license stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving license statistics'
    });
  }
}; 