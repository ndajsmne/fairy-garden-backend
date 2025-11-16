const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getUserByIdValidator, 
  updateUserRoleValidator, 
  deleteUserValidator, 
  listUsersValidator 
} = require('../validators/userValidator');
const User = require('../models/user');

// Create admin user (protected, only existing admins can create new admins)
router.post('/create-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Basic required fields check
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'first_name, last_name, email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    // Create new admin user (User.create expects first_name and last_name)
    const adminUser = await User.create({
      first_name,
      last_name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: adminUser.id,
          first_name: adminUser.first_name,
          last_name: adminUser.last_name,
          email: adminUser.email,
          role: adminUser.role
        }
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create admin user'
    });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Get all users with pagination and filters (admin only)
 *     tags: [Admin, User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 default: 10
 *               role:
 *                 type: string
 *                 enum: [admin, customer]
 *               search:
 *                 type: string
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/users', authenticateToken, requireAdmin, listUsersValidator, AdminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Admin, User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/users/:userId', authenticateToken, requireAdmin, getUserByIdValidator, AdminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role (admin only)
 *     tags: [Admin, User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, customer]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role or cannot change own role
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/users/:userId/role', authenticateToken, requireAdmin, updateUserRoleValidator, AdminController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin, User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete('/users/:userId', authenticateToken, requireAdmin, deleteUserValidator, AdminController.deleteUser);

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics (admin only)
 *     tags: [Admin, Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                     products:
 *                       type: object
 *                     orders:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard/stats', authenticateToken, requireAdmin, AdminController.getDashboardStats);

module.exports = router;