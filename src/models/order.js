const db = require('../config/database');

class Order {
  // Create a new order from cart
  static async createFromCart(userId, shippingAddress) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get cart items with product details
      const [cartItems] = await connection.query(`
        SELECT 
          ci.product_id,
          ci.quantity,
          p.price,
          p.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `, [userId]);

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, status, total_amount, shipping_address) VALUES (?, ?, ?, ?)',
        [userId, 'pending', totalAmount, shippingAddress]
      );
      const orderId = orderResult.insertId;

      // Create order items and update product stock
      for (const item of cartItems) {
        // Check stock availability
        if (item.stock < item.quantity) {
          throw new Error(`Not enough stock for product ID ${item.product_id}`);
        }

        // Create order item
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Update product stock
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await connection.commit();

      return { orderId, totalAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all orders for a user
  static async getUserOrders(userId) {
    try {
      const [orders] = await db.query(`
        SELECT 
          o.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price_at_time,
              'name', p.name,
              'subtotal', (oi.quantity * oi.price_at_time)
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [userId]);

      return orders;
    } catch (error) {
      throw error;
    }
  }

  // Get a single order
  static async getOrderById(orderId, userId = null) {
    try {
      const [orders] = await db.query(`
        SELECT 
          o.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price_at_time,
              'name', p.name,
              'subtotal', (oi.quantity * oi.price_at_time)
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = ? ${userId ? 'AND o.user_id = ?' : ''}
        GROUP BY o.id
      `, userId ? [orderId, userId] : [orderId]);

      return orders[0];
    } catch (error) {
      throw error;
    }
  }

  // Update order status
  static async updateStatus(orderId, status, userId = null) {
    try {
      const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const query = userId
        ? 'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?'
        : 'UPDATE orders SET status = ? WHERE id = ?';
      const params = userId ? [status, orderId, userId] : [status, orderId];

      const [result] = await db.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all orders (admin only)
  static async getAllOrders() {
    try {
      const [orders] = await db.query(`
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
      return orders;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;