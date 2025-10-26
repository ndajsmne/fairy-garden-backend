const db = require('../config/database');

class Product {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM products');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(productData) {
    try {
      const { name, description, price, stock, image_url, category } = productData;
      const [result] = await db.query(
        'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, stock, image_url, category]
      );
      return { id: result.insertId, ...productData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const { name, description, price, stock, image_url, category } = productData;
      const [result] = await db.query(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ? WHERE id = ?',
        [name, description, price, stock, image_url, category, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;