const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      details: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
  }
  next();
};

const createCategoryValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9\-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers and hyphens'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  handleValidationErrors
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9\-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers and hyphens'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  handleValidationErrors
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator
};
