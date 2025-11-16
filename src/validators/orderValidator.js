const { body, validationResult } = require('express-validator');

const createOrderValidator = [
  body('shippingAddress').exists().withMessage('shippingAddress is required').bail().isObject().withMessage('shippingAddress must be an object'),
  body('shippingAddress.address').exists().withMessage('address is required').bail().isString().trim().notEmpty(),
  body('shippingAddress.postalCode').exists().withMessage('postalCode is required').bail().isString().trim().notEmpty(),
  body('shippingAddress.province').exists().withMessage('province is required').bail().isString().trim().notEmpty(),
  body('deliveryMethod').optional().isString().trim(),
  body('deliveryDate').optional().isISO8601().withMessage('deliveryDate must be a valid date'),
  body('deliveryTime').optional().isString().trim(),
  body('recipientName').optional().isString().trim(),
  body('recipientPhone').optional().isString().trim(),
  body('senderName').optional().isString().trim(),
  body('senderPhone').optional().isString().trim(),
  body('cardMessage').optional().isString().trim(),
  body('cardFrom').optional().isString().trim(),
  body('cardTo').optional().isString().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', message: 'Validation failed', details: errors.array() });
    }
    next();
  }
];

module.exports = { createOrderValidator };
