const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createCategoryValidator, updateCategoryValidator } = require('../validators/categoryValidator');

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createCategoryValidator, CategoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategoryValidator, CategoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, CategoryController.deleteCategory);

module.exports = router;