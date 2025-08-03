const LandProcess = require('../models/LandProcess')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/land-documents'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false)
    }
  }
})

// Configure upload fields based on application type
const configureUpload = (applicationType) => {
  const fields = [
    { name: 'landTitleDeed', maxCount: 1 },
    { name: 'surveyPlan', maxCount: 1 },
    { name: 'identificationDocument', maxCount: 1 }
  ]

  if (applicationType === 'Building Permission') {
    fields.push(
      { name: 'buildingPlan', maxCount: 1 },
      { name: 'engineeringReport', maxCount: 1 },
      { name: 'environmentalAssessment', maxCount: 1 }
    )
  }

  return upload.fields(fields)
}

// Submit land process application
const submitLandProcess = async (req, res) => {
  try {
    const { applicationType, ownerName, landLocation, landType, buildingPurpose, buildingSize, estimatedCost, additionalData } = req.body
    const userId = req.user.id

    // Validate required fields
    if (!applicationType || !ownerName || !landLocation || !landType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
    }

    // Check if files were uploaded
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Required documents must be uploaded'
      })
    }

    // Validate required documents
    const requiredDocs = ['landTitleDeed', 'surveyPlan', 'identificationDocument']
    if (applicationType === 'Building Permission') {
      requiredDocs.push('buildingPlan', 'engineeringReport', 'environmentalAssessment')
    }

    for (const doc of requiredDocs) {
      if (!req.files[doc]) {
        return res.status(400).json({
          success: false,
          message: `Missing required document: ${doc}`
        })
      }
    }

    // Create document paths
    const documents = {}
    Object.keys(req.files).forEach(fieldName => {
      documents[fieldName] = req.files[fieldName][0].path
    })

    // Create land process
    const landProcess = new LandProcess({
      userId,
      applicationType,
      ownerName,
      landLocation,
      landType,
      buildingPurpose,
      buildingSize,
      estimatedCost,
      documents,
      additionalData: additionalData ? JSON.parse(additionalData) : {}
    })

    await landProcess.save()

    res.status(201).json({
      success: true,
      message: `${applicationType} application submitted successfully`,
      data: landProcess
    })

  } catch (error) {
    console.error('Error submitting land process:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Get user's land processes
const getUserLandProcesses = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status, applicationType } = req.query

    const query = { userId }
    if (status && status !== 'all') query.status = status
    if (applicationType && applicationType !== 'all') query.applicationType = applicationType

    const skip = (page - 1) * limit

    const processes = await LandProcess.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')

    const total = await LandProcess.countDocuments(query)

    res.json({
      success: true,
      data: processes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Error fetching user land processes:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Get single land process
const getLandProcess = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const process = await LandProcess.findById(id).populate('userId', 'name email')

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Land process not found'
      })
    }

    // Check if user is authorized to view this process
    if (process.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this process'
      })
    }

    res.json({
      success: true,
      data: process
    })

  } catch (error) {
    console.error('Error fetching land process:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Admin: Get all land processes
const getAllLandProcesses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, applicationType, search } = req.query

    const query = {}
    if (status && status !== 'all') query.status = status
    if (applicationType && applicationType !== 'all') query.applicationType = applicationType
    if (search) {
      query.$or = [
        { ownerName: { $regex: search, $options: 'i' } },
        { landLocation: { $regex: search, $options: 'i' } },
        { landType: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const processes = await LandProcess.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('processedBy', 'name')

    const total = await LandProcess.countDocuments(query)

    // Get statistics
    const stats = await LandProcess.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
        }
      }
    ])

    res.json({
      success: true,
      data: processes,
      stats: stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Error fetching all land processes:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Admin: Update land process status
const updateLandProcessStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, rejectionReason } = req.body
    const adminId = req.user.id

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Approved or Rejected'
      })
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an application'
      })
    }

    const process = await LandProcess.findById(id).populate('userId', 'name email')

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Land process not found'
      })
    }

    // Update process
    process.status = status
    process.processedDate = new Date()
    process.processedBy = adminId
    if (status === 'Rejected') {
      process.rejectionReason = rejectionReason
    }

    await process.save()

    // TODO: Send notification to user (email/SMS)
    // This could be implemented with a notification service

    res.json({
      success: true,
      message: `Land process ${status.toLowerCase()} successfully`,
      data: process
    })

  } catch (error) {
    console.error('Error updating land process status:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Download document
const downloadDocument = async (req, res) => {
  try {
    const { id, documentType } = req.params
    const userId = req.user.id

    const process = await LandProcess.findById(id)

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Land process not found'
      })
    }

    // Check authorization
    if (process.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this document'
      })
    }

    const documentPath = process.documents[documentType]
    if (!documentPath) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      })
    }

    // Check if file exists
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      })
    }

    res.download(documentPath)

  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = {
  submitLandProcess,
  getUserLandProcesses,
  getLandProcess,
  getAllLandProcesses,
  updateLandProcessStatus,
  downloadDocument,
  configureUpload
} 