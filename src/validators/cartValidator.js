const { body, validationResult } = require('express-validator');

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
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for adding item to cart
 */
const addToCartValidator = [
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  
  handleValidationErrors
];

/**
 * Validation rules for updating cart item quantity
 */
const updateCartValidator = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  
  handleValidationErrors
];

/**
 * Validation rules for removing item from cart
 */
const removeFromCartValidator = [
  // Cart item ID is validated via URL params
  body().custom(() => true), // Placeholder for consistency
  
  handleValidationErrors
];

module.exports = {
  addToCartValidator,
  updateCartValidator,
  removeFromCartValidator
};
