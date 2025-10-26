const db = require('../config/database');
const { snap, core } = require('../config/midtrans');

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
      const parameter = {
        transaction_details: {
          order_id: `ORDER-${order.id}`,
          gross_amount: order.total_amount
        },
        customer_details: {
          first_name: user.name,
          email: user.email
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
      const orderId = statusResponse.order_id.replace('ORDER-', '');
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

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
      }

      // Update payment status
      await db.query(
        'UPDATE payments SET status = ?, transaction_id = ? WHERE order_id = ?',
        [paymentStatus, statusResponse.transaction_id, orderId]
      );

      // If payment is completed, update order status
      if (paymentStatus === 'completed') {
        await db.query(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['paid', orderId]
        );
      } else if (paymentStatus === 'failed') {
        await db.query(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['cancelled', orderId]
        );
      }

      return { orderId, paymentStatus };
    } catch (error) {
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