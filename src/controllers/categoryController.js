const Category = require('../models/category');
const { AppError } = require('../middleware/errorHandler');

class CategoryController {
    // Get all categories
    static async getAllCategories(req, res) {
        try {
            const categories = await Category.getAll();
            res.json({
                status: 'success',
                data: categories
            });
        } catch (error) {
            console.error('Error getting categories:', error.message, error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get categories',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get category by ID
    static async getCategoryById(req, res) {
        try {
            const category = await Category.getById(req.params.id);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
            res.json({
                status: 'success',
                data: category
            });
        } catch (error) {
            console.error('Error getting category:', error);
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message || 'Failed to get category'
            });
        }
    }

    // Create new category
    static async createCategory(req, res) {
        try {
            const category = await Category.create(req.body);
            res.status(201).json({
                status: 'success',
                data: category
            });
        } catch (error) {
            console.error('Error creating category:', error.message || error);
            // Handle duplicate slug / unique constraint
            if (error && error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    status: 'error',
                    message: 'Category with the same slug or name already exists',
                    details: process.env.NODE_ENV === 'development' ? error.sqlMessage || error.message : undefined
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Failed to create category',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Update category
    static async updateCategory(req, res) {
        try {
            const category = await Category.update(req.params.id, req.body);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
            res.json({
                status: 'success',
                data: category
            });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message || 'Failed to update category'
            });
        }
    }

    // Delete category
    static async deleteCategory(req, res) {
        try {
            const success = await Category.delete(req.params.id);
            if (!success) {
                throw new AppError('Category not found', 404);
            }
            res.json({
                status: 'success',
                message: 'Category deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message || 'Failed to delete category'
            });
        }
    }
}

module.exports = CategoryController;