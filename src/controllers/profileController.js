const User = require('../models/user');

class ProfileController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Remove sensitive data
      delete user.password;

      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { first_name, last_name, phone_number } = req.body;

      const updatedUser = await User.updateProfile(userId, {
        first_name,
        last_name,
        phone_number
      });

      res.status(200).json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      const success = await User.updatePassword(userId, currentPassword, newPassword);

      if (success) {
        res.status(200).json({
          status: 'success',
          message: 'Password successfully updated'
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to update password'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = ProfileController;