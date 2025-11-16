const { param, body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        location: err.location
      }))
    });
  }
  next();
};

/**
 * Validation for getting user by ID (URL param)
 */
const getUserByIdValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  handleValidationErrors
];

/**
 * Validation for updating user role
 */
const updateUserRoleValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'customer'])
    .withMessage('Role must be either "admin" or "customer"'),
  
  handleValidationErrors
];

/**
 * Validation for deleting user
 */
const deleteUserValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  handleValidationErrors
];

/**
 * Validation for listing users with pagination
 */
const listUsersValidator = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  body('role')
    .optional()
    .isIn(['admin', 'customer'])
    .withMessage('Role filter must be either "admin" or "customer"'),
  
  body('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  getUserByIdValidator,
  updateUserRoleValidator,
  deleteUserValidator,
  listUsersValidator
};
