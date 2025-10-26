const db = require('../config/database');

class Cart {
  // Get cart items for a user with product details
  static async getCartItems(userId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          ci.id,
          ci.quantity,
          p.id as product_id,
          p.name as product_name,
          p.price,
          p.image_url,
          (p.price * ci.quantity) as subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Add item to cart
  static async addItem(userId, productId, quantity) {
    try {
      // Check if product exists and has enough stock
      const [product] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
      if (!product[0]) {
        throw new Error('Product not found');
      }
      if (product[0].stock < quantity) {
        throw new Error('Not enough stock available');
      }

      // Check if item already exists in cart
      const [existingItem] = await db.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existingItem[0]) {
        // Update quantity if item exists
        const newQuantity = existingItem[0].quantity + quantity;
        if (product[0].stock < newQuantity) {
          throw new Error('Not enough stock available');
        }

        const [result] = await db.query(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, existingItem[0].id]
        );
        return { id: existingItem[0].id, quantity: newQuantity };
      } else {
        // Add new item if it doesn't exist
        const [result] = await db.query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
        return { id: result.insertId, quantity };
      }
    } catch (error) {
      throw error;
    }
  }

  // Update cart item quantity
  static async updateItemQuantity(userId, cartItemId, quantity) {
    try {
      // Verify cart item belongs to user and get product info
      const [cartItem] = await db.query(`
        SELECT ci.*, p.stock 
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ? AND ci.user_id = ?
      `, [cartItemId, userId]);

      if (!cartItem[0]) {
        throw new Error('Cart item not found');
      }

      if (cartItem[0].stock < quantity) {
        throw new Error('Not enough stock available');
      }

      const [result] = await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, cartItemId, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Remove item from cart
  static async removeItem(userId, cartItemId) {
    try {
      const [result] = await db.query(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Clear cart
  static async clearCart(userId) {
    try {
      const [result] = await db.query(
        'DELETE FROM cart_items WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get cart total
  static async getCartTotal(userId) {
    try {
      const [result] = await db.query(`
        SELECT SUM(p.price * ci.quantity) as total
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `, [userId]);
      return result[0].total || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cart;