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

  static async create(userData) {
    try {
      const { name, email, password, role = 'customer' } = userData;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      return {
        id: result.insertId,
        name,
        email,
        role
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;