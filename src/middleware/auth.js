const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token.'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error checking user role'
    });
  }
};

// Middleware to check if user is customer
const requireCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Customer privileges required.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error checking user role'
    });
  }
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (paramIdField) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // For customers, check if they own the resource
      const resourceId = req.params[paramIdField];
      if (resourceId !== req.user.userId.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You do not own this resource.'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking resource ownership'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireCustomer,
  requireOwnershipOrAdmin
};