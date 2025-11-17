const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID - returns an array of rows to match existing callsites that destructure the result
  static async findById(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      // Return the rows array so callers using: const [user] = await User.findById(id)
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { 
        first_name, 
        last_name, 
        email, 
        password, 
        phone_number,
        role = 'customer' 
      } = userData;
      // Ensure we have valid first and last names
      if (!first_name || !last_name) {
        throw new Error('First name and last name are required');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Use phone_number, default to '-' if not provided
      const phoneValue = phone_number || '-';

      // Insert into users table with all fields including phone_number
      const [result] = await db.query(
        'INSERT INTO users (first_name, last_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, hashedPassword, phoneValue, role]
      );

      return {
        id: result.insertId,
        first_name,
        last_name,
        email,
        phone_number: phoneValue,
        role
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, userData) {
    try {
      const { first_name, last_name, phone_number } = userData;

      // Update user profile
      const [result] = await db.query(
        'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
        [first_name, last_name, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return {
        id: userId,
        first_name,
        last_name
      };
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(userId, oldPassword, newPassword) {
    try {
      // Get current user data
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      const user = rows[0];

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      const [result] = await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Get all users with pagination and filtering (admin only)
   */
  static async getAllUsers(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role = null, 
        search = null 
      } = options;

      const offset = (page - 1) * limit;
      let query = 'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE 1=1';
      const params = [];

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      if (search) {
        query += ' AND (CONCAT(first_name, " ", last_name) LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams = [];

      if (role) {
        countQuery += ' AND role = ?';
        countParams.push(role);
      }

      if (search) {
        countQuery += ' AND (CONCAT(first_name, " ", last_name) LIKE ? OR email LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countRows] = await db.query(countQuery, countParams);
      const total = countRows[0].total;

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId, newRole) {
    try {
      if (!['admin', 'customer'].includes(newRole)) {
        throw new Error('Invalid role. Must be admin or customer.');
      }

      const [result] = await db.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [newRole, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId) {
    try {
      // Deletion logic handled by controller (prevents self-deletion there)

      const [result] = await db.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;