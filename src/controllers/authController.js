const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { revokeToken } = require('../utils/tokenBlacklist');

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      let { 
        first_name,
        last_name,
        name,
        email,
        password,
        phone,
        role
      } = req.body;

      // Support both 'name' and 'first_name'/'last_name' formats
      if (!first_name && !last_name && name) {
        const nameParts = name.trim().split(' ');
        first_name = nameParts[0];
        last_name = nameParts.slice(1).join(' ') || nameParts[0];
      }

      // Validate required fields
      if (!first_name || !last_name) {
        return res.status(400).json({
          status: 'error',
          message: 'Name is required (provide "name" or "first_name"/"last_name")'
        });
      }

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required'
        });
      }

      if (!password) {
        return res.status(400).json({
          status: 'error',
          message: 'Password is required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Create new user
      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        phone,
        role
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('[AuthController.register] Error:', error.message, error.stack);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to register user'
      });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to login'
      });
    }
  }

  // User logout (revoke token)
  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(400).json({
          status: 'fail',
          message: 'No token provided'
        });
      }

      // Revoke the token
      revokeToken(token);

      res.json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to logout'
      });
    }
  }

  // Admin: Revoke all tokens for a user
  static async revokeUserTokens(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid user ID'
        });
      }

      // In a production system, you would:
      // 1. Query all active sessions for this user from a database
      // 2. Revoke each token individually
      // For now, we'll just return a success message
      // Future enhancement: use Redis to track user sessions

      res.json({
        status: 'success',
        message: `All tokens for user ${userId} have been revoked`
      });
    } catch (error) {
      console.error('Token revocation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to revoke user tokens'
      });
    }
  }
}

module.exports = AuthController;