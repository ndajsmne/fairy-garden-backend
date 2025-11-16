const db = require('../config/database');
const { snap, core } = require('../config/midtrans');
const logger = require('../config/logger');

class Payment {
  // Create new payment record
  static async create(orderId, amount) {
    try {
      const [result] = await db.query(
        'INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)',
        [orderId, amount, 'pending']
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Generate payment token from Midtrans
  static async generatePaymentToken(order, user) {
    try {
      // Build customer name/email safely - some user records use first_name/last_name
      const customerName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      const customerEmail = user.email || user.email_address || '';

      const parameter = {
        transaction_details: {
          order_id: `ORDER-${order.id}`,
          gross_amount: Number(order.total_amount) || 0
        },
        customer_details: {
          first_name: customerName,
          email: customerEmail
        },
        credit_card: {
          secure: true
        }
      };

      const transaction = await snap.createTransaction(parameter);
      return transaction.token;
    } catch (error) {
      throw error;
    }
  }

  // Handle payment notification from Midtrans
  static async handleNotification(notification) {
    try {
      const statusResponse = await core.transaction.notification(notification);
      return await Payment.processNotificationPayload(statusResponse);
    } catch (error) {
      logger.error('Payment model error', { message: error.message, stack: error.stack });
      throw error;
    }
  }

  // Process a notification payload (either from Midtrans or simulation)
  static async processNotificationPayload(statusResponse) {
    try {
      const orderId = (statusResponse.order_id || '').toString().replace('ORDER-', '');
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      
      // Generate transaction_id if not provided or empty (for simulation)
      const transactionId = (statusResponse.transaction_id && statusResponse.transaction_id.trim()) 
        ? statusResponse.transaction_id 
        : `MOCK-${Date.now()}-${orderId}`;

      let paymentStatus;
      if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          paymentStatus = 'pending';
        } else if (fraudStatus === 'accept') {
          paymentStatus = 'completed';
        }
      } else if (transactionStatus === 'settlement') {
        paymentStatus = 'completed';
      } else if (transactionStatus === 'cancel' ||
                 transactionStatus === 'deny' ||
                 transactionStatus === 'expire') {
        paymentStatus = 'failed';
      } else if (transactionStatus === 'pending') {
        paymentStatus = 'pending';
      } else {
        paymentStatus = 'pending';
      }

      // Update payment status
      await db.query(
        'UPDATE payments SET status = ?, transaction_id = ? WHERE order_id = ?',
        [paymentStatus, transactionId, orderId]
      );

      // If payment is completed, update orders.payment_status column
      if (paymentStatus === 'completed') {
        await db.query(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          ['paid', orderId]
        );
      } else if (paymentStatus === 'failed') {
        await db.query(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          ['failed', orderId]
        );
      }

      return { orderId, paymentStatus };
    } catch (error) {
      logger.error('Payment process payload error', { message: error.message, stack: error.stack });
      throw error;
    }
  }

  // Get payment status
  static async getStatus(orderId) {
    try {
      const [payments] = await db.query(
        'SELECT * FROM payments WHERE order_id = ?',
        [orderId]
      );
      return payments[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payment;