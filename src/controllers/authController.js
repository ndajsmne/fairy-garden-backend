const jwt = require('jsonwebtoken');
const User = require('../models/user');

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

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
        name,
        email,
        password
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
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to register user'
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
}

module.exports = AuthController;