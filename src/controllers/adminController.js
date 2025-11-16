const User = require('../models/user');

class AdminController {
  /**
   * Get all users with pagination and filters
   * GET /api/admin/users
   */
  static async getAllUsers(req, res) {
    try {
      const { page, limit, role, search } = req.body;

      const result = await User.getAllUsers({
        page: page || 1,
        limit: limit || 10,
        role,
        search
      });

      res.json({
        status: 'success',
        message: 'Users retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve users'
      });
    }
  }

  /**
   * Get single user by ID
   * GET /api/admin/users/:userId
   */
  static async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const [user] = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Don't send password
      delete user.password;

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve user'
      });
    }
  }

  /**
   * Update user role
   * PUT /api/admin/users/:userId/role
   */
  static async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Prevent changing own role to customer
      if (parseInt(userId) === req.user.userId && role === 'customer') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot change your own role to customer'
        });
      }

      // Verify user exists
      const [user] = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const success = await User.updateUserRole(userId, role);

      if (success) {
        res.json({
          status: 'success',
          message: `User role updated to ${role} successfully`,
          data: {
            userId,
            newRole: role
          }
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to update user role'
        });
      }
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update user role'
      });
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:userId
   */
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Prevent deleting yourself
      if (parseInt(userId) === req.user.userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete your own account'
        });
      }

      // Verify user exists
      const [user] = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const success = await User.deleteUser(userId);

      if (success) {
        res.json({
          status: 'success',
          message: 'User deleted successfully',
          data: {
            userId,
            email: user.email
          }
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to delete user'
        });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete user'
      });
    }
  }

  /**
   * Get admin dashboard statistics
   * GET /api/admin/dashboard/stats
   */
  static async getDashboardStats(req, res) {
    try {
      const db = require('../config/database');

      // Get total users count
      const [userStats] = await db.query(
        'SELECT COUNT(*) as total, SUM(role="admin") as admins, SUM(role="customer") as customers FROM users'
      );

      // Get total products count
      const [productStats] = await db.query(
        'SELECT COUNT(*) as total FROM products'
      );

      // Get total orders count
      const [orderStats] = await db.query(
        'SELECT COUNT(*) as total FROM orders'
      );

      // Get recent orders
      const [recentOrders] = await db.query(
        'SELECT id, user_id, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5'
      );

      // Get payment statistics
      const [paymentStats] = await db.query(
        'SELECT status, COUNT(*) as count FROM payments GROUP BY status'
      );

      res.json({
        status: 'success',
        message: 'Dashboard statistics retrieved successfully',
        data: {
          users: userStats[0],
          products: productStats[0],
          orders: orderStats[0],
          recentOrders,
          paymentStats
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve dashboard statistics'
      });
    }
  }
}

module.exports = AdminController;
