const { body, param, validationResult } = require('express-validator');

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
 * Validation rules for initiating payment
 */
const initiatePaymentValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  handleValidationErrors
];

/**
 * Validation rules for getting payment status
 */
const getPaymentStatusValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  handleValidationErrors
];

/**
 * Validation rules for Midtrans notification callback
 */
const simulateNotificationValidator = [
  body('order_id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  body('transaction_status')
    .notEmpty()
    .withMessage('Transaction status is required')
    .isIn(['pending', 'capture', 'settle', 'cancel', 'deny', 'expire'])
    .withMessage('Transaction status must be one of: pending, capture, settle, cancel, deny, expire'),
  
  body('payment_type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Payment type must be between 1 and 50 characters'),
  
  handleValidationErrors
];

module.exports = {
  initiatePaymentValidator,
  getPaymentStatusValidator,
  simulateNotificationValidator
};
