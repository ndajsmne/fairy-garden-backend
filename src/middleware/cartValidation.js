const { body } = require('express-validator');
const { validateRequest } = require('./validation');

const validateCartItem = [
  body('productId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),

  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  validateRequest
];

module.exports = {
  validateCartItem
};