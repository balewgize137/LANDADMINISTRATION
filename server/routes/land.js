const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const {
  submitLandProcess,
  getUserLandProcesses,
  getLandProcess,
  getAllLandProcesses,
  updateLandProcessStatus,
  downloadDocument,
  configureUpload
} = require('../controllers/landController')

// Client routes (protected)
router.post('/transfer', protect, (req, res, next) => {
  const upload = configureUpload('Transfer Land')
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }
    next()
  })
}, submitLandProcess)

router.post('/add-new', protect, (req, res, next) => {
  const upload = configureUpload('Add New Land')
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }
    next()
  })
}, submitLandProcess)

router.post('/permission', protect, (req, res, next) => {
  const upload = configureUpload('Building Permission')
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }
    next()
  })
}, submitLandProcess)

router.get('/user', protect, getUserLandProcesses)
router.get('/user/:id', protect, getLandProcess)
router.get('/documents/:id/:documentType', protect, downloadDocument)

// Admin routes (protected + admin)
router.get('/admin', protect, authorize('Admin'), getAllLandProcesses)
router.get('/admin/:id', protect, authorize('Admin'), getLandProcess)
router.put('/admin/:id/status', protect, authorize('Admin'), updateLandProcessStatus)
router.get('/admin/documents/:id/:documentType', protect, authorize('Admin'), downloadDocument)

module.exports = router 