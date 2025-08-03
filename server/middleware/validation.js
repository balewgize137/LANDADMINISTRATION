const { body, param, query } = require('express-validator');

// User Registration Validation
exports.validateSignup = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha()
    .withMessage('First name must contain only letters'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha()
    .withMessage('Last name must contain only letters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('nationalId')
    .notEmpty()
    .withMessage('National ID is required')
    .isLength({ min: 10 })
    .withMessage('National ID must be at least 10 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        throw new Error('You must be at least 16 years old');
      }
      return true;
    }),
  
  body('role')
    .optional()
    .isIn(['Public', 'Admin'])
    .withMessage('Role must be either Public or Admin')
];

// User Login Validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Vehicle Registration Validation
exports.validateVehicleRegistration = [
  body('make')
    .notEmpty()
    .withMessage('Vehicle make is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Vehicle make must be between 2 and 50 characters'),
  
  body('model')
    .notEmpty()
    .withMessage('Vehicle model is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Vehicle model must be between 1 and 50 characters'),
  
  body('year')
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage(`Vehicle year must be between 1950 and ${new Date().getFullYear() + 1}`),
  
  body('color')
    .notEmpty()
    .withMessage('Vehicle color is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Vehicle color must be between 2 and 30 characters'),
  
  body('engineNumber')
    .notEmpty()
    .withMessage('Engine number is required')
    .isLength({ min: 5, max: 30 })
    .withMessage('Engine number must be between 5 and 30 characters'),
  
  body('chassisNumber')
    .notEmpty()
    .withMessage('Chassis number is required')
    .isLength({ min: 10, max: 30 })
    .withMessage('Chassis number must be between 10 and 30 characters'),
  
  body('vehicleType')
    .isIn(['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle'])
    .withMessage('Invalid vehicle type'),
  
  body('fuelType')
    .isIn(['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'])
    .withMessage('Invalid fuel type'),
  
  body('applicationType')
    .isIn(['New Registration', 'Transfer', 'Renewal', 'Replacement'])
    .withMessage('Invalid application type')
];

// License Application Validation
exports.validateLicenseApplication = [
  body('applicationType')
    .isIn(['New License', 'Renewal', 'Replacement', 'Upgrade', 'International'])
    .withMessage('Invalid application type'),
  
  body('licenseType')
    .isIn(['Private', 'Commercial', 'Motorcycle', 'Heavy Vehicle', 'Public Transport', 'Taxi'])
    .withMessage('Invalid license type'),
  
  body('licenseClass')
    .isIn(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'])
    .withMessage('Invalid license class'),
  
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  
  body('emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required'),
  
  body('emergencyContact.phone')
    .notEmpty()
    .withMessage('Emergency contact phone is required')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('medicalInfo.bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type')
];

// Transport Route Validation
exports.validateTransportRoute = [
  body('routeNumber')
    .notEmpty()
    .withMessage('Route number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Route number must be between 1 and 20 characters'),
  
  body('routeName')
    .notEmpty()
    .withMessage('Route name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Route name must be between 2 and 100 characters'),
  
  body('transportType')
    .isIn(['Bus', 'Metro', 'Train', 'Tram', 'Ferry'])
    .withMessage('Invalid transport type'),
  
  body('startLocation.name')
    .notEmpty()
    .withMessage('Start location name is required'),
  
  body('startLocation.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Start location latitude must be between -90 and 90'),
  
  body('startLocation.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Start location longitude must be between -180 and 180'),
  
  body('endLocation.name')
    .notEmpty()
    .withMessage('End location name is required'),
  
  body('endLocation.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('End location latitude must be between -90 and 90'),
  
  body('endLocation.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('End location longitude must be between -180 and 180'),
  
  body('pricing.baseFare')
    .isFloat({ min: 0 })
    .withMessage('Base fare must be a positive number'),
  
  body('operational.capacity')
    .isInt({ min: 1 })
    .withMessage('Vehicle capacity must be at least 1'),
  
  body('operational.operatingHours.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('operational.operatingHours.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

// Update Password Validation
exports.validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// MongoDB ObjectId Validation
exports.validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Pagination Validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Search Location Validation
exports.validateLocationSearch = [
  query('startLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Start latitude must be between -90 and 90'),
  
  query('startLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Start longitude must be between -180 and 180'),
  
  query('endLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('End latitude must be between -90 and 90'),
  
  query('endLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('End longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters')
];

// Status Update Validation
exports.validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
];

// Admin Note Validation
exports.validateAdminNote = [
  body('note')
    .notEmpty()
    .withMessage('Note is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Note must be between 2 and 500 characters')
]; 