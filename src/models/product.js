const db = require('../config/database');

class Product {
  static async getAll({ 
    search = '', 
    category = '', 
    sortBy = 'created_at', 
    sortOrder = 'DESC',
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    page = 1,
    limit = 12
  } = {}) {
    try {
      // Build the WHERE clause
      const whereConditions = ['1=1']; // Always true condition to start
      const params = [];

      // Search by name or description
      if (search) {
        whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      // Filter by category
      if (category) {
        whereConditions.push('c.name = ?');
        params.push(category);
      }

      // Filter by price range
      whereConditions.push('p.price BETWEEN ? AND ?');
      params.push(minPrice, maxPrice);

      // Validate sortBy to prevent SQL injection
      const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      
      // Validate sortOrder
      const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Get total count for pagination
      const [countResult] = await db.query(`
        SELECT COUNT(*) as total
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ${whereConditions.join(' AND ')}
      `, params);

      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated results
      const [rows] = await db.query(`
        SELECT 
          p.*,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY p.${validSortBy} ${validSortOrder}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      return {
        items: rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('[Product.getAll] Error:', error.message, error.stack);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      // Get product details
      const [rows] = await db.query(`
        SELECT 
          p.*,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `, [id]);

      if (!rows[0]) return null;

      // Get related products (if related_products table exists)
      let relatedProducts = [];
      try {
        const [related] = await db.query(`
          SELECT 
            p.*,
            c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id IN (
            SELECT related_product_id FROM related_products WHERE product_id = ?
          )
          LIMIT 4
        `, [id]);
        relatedProducts = related || [];
      } catch (e) {
        // related_products table doesn't exist, skip
      }

      return {
        ...rows[0],
        relatedProducts
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(productData) {
    try {
      const { name, description, price, stock, image_url, category_id } = productData;
      const [result] = await db.query(
        'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, stock, image_url, category_id]
      );
      return { id: result.insertId, ...productData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const { name, description, price, stock, image_url, category_id } = productData;
      const [result] = await db.query(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category_id = ? WHERE id = ?',
        [name, description, price, stock, image_url, category_id, id]
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

  static async getFeatured() {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.price,
          p.image_url,
          p.stock,
          p.description,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 6
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}
 
module.exports = Product;