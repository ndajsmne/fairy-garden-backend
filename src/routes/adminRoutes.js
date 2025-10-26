const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/user');

// Create admin user (protected, only existing admins can create new admins)
router.post('/create-admin', authenticateToken, requireAdmin, async (req, res) => {
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

    // Create new admin user
    const adminUser = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: adminUser.id,
          name: adminUser.name,
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

module.exports = router;