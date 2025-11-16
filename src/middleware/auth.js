const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { isRevoked } = require('../utils/tokenBlacklist');

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

    // Check token revocation
    if (isRevoked(token)) {
      return res.status(401).json({ status: 'fail', message: 'Token has been revoked. Please login again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token expiry and validity handled by jwt.verify; handle specific errors in catch
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    // More specific JWT error handling
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'fail', message: 'Invalid token.' });
    }

    return res.status(401).json({ status: 'fail', message: 'Authentication failed.' });
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