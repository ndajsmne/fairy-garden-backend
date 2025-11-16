const db = require('../config/database');

class Order {
  // Create a new order from cart
  static async createFromCart(userId, shippingAddress, orderData = {}) {
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

      // Format shipping address into a string for delivery_address column
      const formattedAddress = typeof shippingAddress === 'object'
        ? shippingAddress.address
        : shippingAddress;

      // Build order fields according to database/fairy_garden.sql schema
      const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 900 + 100);
      const status = 'diproses'; // default status in SQL file
      const deliveryMethod = orderData.deliveryMethod || 'delivery';
      const deliveryDate = orderData.deliveryDate || new Date().toISOString().split('T')[0];
      const deliveryTime = orderData.deliveryTime || '12:00:00';
      const recipientName = orderData.recipientName || '';
      const recipientPhone = orderData.recipientPhone || '';
      const senderName = orderData.senderName || '';
      const senderPhone = orderData.senderPhone || '';
      const province = shippingAddress.province || orderData.province || null;
      const postal_code = shippingAddress.postalCode || orderData.postalCode || null;
      const card_message = orderData.cardMessage || '';
      const card_from = orderData.cardFrom || '';
      const card_to = orderData.cardTo || '';
      const subtotal = totalAmount;
        const delivery_fee = 25000; // Default delivery fee
        const handling_fee = 10000; // Default handling & service fee
        const total_amount = totalAmount + delivery_fee + handling_fee; // Include fees in total
      const payment_method = orderData.paymentMethod || 'qris';
      const payment_status = 'pending';

      // Create order using fields present in database/fairy_garden.sql
      const [orderResult] = await connection.query(
        `INSERT INTO orders (
          user_id, order_number, status, delivery_method, delivery_date, delivery_time,
          recipient_name, recipient_phone, sender_name, sender_phone,
          delivery_address, province, postal_code, card_message, card_from, card_to,
          subtotal, delivery_fee, handling_service_fee, total_amount, payment_method, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, orderNumber, status, deliveryMethod, deliveryDate, deliveryTime,
         recipientName, recipientPhone, senderName, senderPhone,
         formattedAddress, province, postal_code, card_message, card_from, card_to,
         subtotal, delivery_fee, handling_fee, total_amount, payment_method, payment_status]
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
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
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

        return { 
          orderId, 
          subtotal: totalAmount,
          deliveryFee: 25000,
          handlingFee: 10000,
          totalAmount: totalAmount + 25000 + 10000
        };
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
      console.log('[Order Model] Getting orders for user:', userId);
      
      // First check if the user has any orders
      const [orderCheck] = await db.query(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [userId]
      );
      console.log('[Order Model] Order count:', orderCheck[0].count);

      if (orderCheck[0].count === 0) {
        return []; // Return empty array if no orders
      }

      // Get orders first
      const [orders] = await db.query(`
        SELECT 
          o.id,
          o.user_id,
          o.status,
            o.subtotal,
            o.delivery_fee,
            o.handling_service_fee,
          o.delivery_address,
          o.province,
          o.postal_code,
          o.created_at,
          o.updated_at
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `, [userId]);

      // For each order, get its items
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const [items] = await db.query(`
          SELECT 
            oi.product_id,
            oi.quantity,
            oi.price as price,
            p.name,
            (oi.quantity * oi.price) as subtotal
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);
        
        // Normalize shipping/delivery address into shippingAddress object for API consumers
        return {
          id: order.id,
          user_id: order.user_id,
          status: order.status,
          total_amount: order.total_amount,
          shippingAddress: {
            address: order.delivery_address,
            city: null,
            province: order.province,
            postalCode: order.postal_code
          },
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: items
        };
      }));

      console.log('[Order Model] Retrieved orders:', ordersWithItems);
      return ordersWithItems;
    } catch (error) {
      console.error('[Order Model] Error:', error.stack || error);
      throw error;
    }
  }

  // Get a single order
  static async getOrderById(orderId, userId = null) {
    try {
      console.log('[Order Model] Getting order by ID:', { orderId, userId });

      // First get the order details
      const [orders] = await db.query(
        `SELECT * FROM orders WHERE id = ? ${userId ? 'AND user_id = ?' : ''}`,
        userId ? [orderId, userId] : [orderId]
      );
      console.log('[Order Model] Order details:', orders[0]);

      if (!orders[0]) {
        return null;
      }

      // Then get order items
      const [items] = await db.query(`
        SELECT 
          oi.product_id,
          oi.quantity,
          oi.price as price,
          p.name,
          (oi.quantity * oi.price) as subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);
      console.log('[Order Model] Order items:', items);

      // Combine order and items
        const order = orders[0];
        const orderWithItems = {
          ...order,
          subtotal: order.subtotal,
          deliveryFee: order.delivery_fee,
          handlingFee: order.handling_service_fee,
          totalAmount: (order.subtotal || 0) + (order.delivery_fee || 0) + (order.handling_service_fee || 0),
          items: items
        };

      console.log('[Order Model] Final order data:', orderWithItems);
      return orderWithItems;
    } catch (error) {
      console.error('[Order Model] Error getting order:', error.stack || error);
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
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
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