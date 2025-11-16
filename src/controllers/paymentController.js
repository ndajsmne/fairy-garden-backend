const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');
const logger = require('../config/logger');

class PaymentController {
  // Initiate payment for an order
  static async initiatePayment(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.userId;

      // Get order details
      const order = await Order.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }

      // Check if payment already exists
      const existingPayment = await Payment.getStatus(orderId);
      if (existingPayment && existingPayment.status === 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Payment already completed for this order'
        });
      }

      // Get user details
      const [user] = await User.findById(userId);

      // Create or update payment record (only create if no payment exists; don't create duplicates)
      if (!existingPayment) {
        await Payment.create(orderId, order.total_amount);
      }

      // Generate payment token
      const paymentToken = await Payment.generatePaymentToken(order, user);

      res.json({
        status: 'success',
        data: {
          token: paymentToken,
          orderId: order.id
        }
      });
    } catch (error) {
      logger.error('Payment initiation error', { message: error.message, stack: error.stack });
      res.status(500).json({
        status: 'error',
        message: 'Failed to initiate payment'
      });
    }
  }

  // Handle payment notification from Midtrans
  static async handleNotification(req, res) {
    try {
      const notification = req.body;

      // Process notification (this will call Midtrans validation internally)
      const { orderId, paymentStatus } = await Payment.handleNotification(notification);

      res.json({
        status: 'success',
        message: `Payment status updated to ${paymentStatus} for order ${orderId}`
      });
    } catch (error) {
      logger.error('Payment notification error', { message: error.message, stack: error.stack });
      res.status(500).json({
        status: 'error',
        message: 'Failed to process payment notification'
      });
    }
  }

  // Simulate payment notification (test helper)
  static async simulateNotification(req, res) {
    try {
      const payload = req.body; // expect order_id, transaction_status, transaction_id, fraud_status (optional)
      const { orderId, paymentStatus } = await Payment.processNotificationPayload(payload);

      res.json({
        status: 'success',
        message: `Simulated payment status updated to ${paymentStatus} for order ${orderId}`
      });
    } catch (error) {
      logger.error('Payment simulation error', { message: error.message, stack: error.stack });
      res.status(500).json({ status: 'error', message: 'Failed to simulate notification' });
    }
  }

  // Get payment status
  static async getPaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.userId;

      // Verify order belongs to user if not admin
      if (req.user.role !== 'admin') {
        const order = await Order.getOrderById(orderId, userId);
        if (!order) {
          return res.status(404).json({
            status: 'error',
            message: 'Order not found'
          });
        }
      }

      const payment = await Payment.getStatus(orderId);
      if (!payment) {
        return res.status(404).json({
          status: 'error',
          message: 'Payment not found'
        });
      }

      res.json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error('Get payment status error', { message: error.message, stack: error.stack });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get payment status'
      });
    }
  }
}

module.exports = PaymentController;