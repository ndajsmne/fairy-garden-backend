const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');

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

      // Create payment record
      await Payment.create(orderId, order.total_amount);

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
      console.error('Payment initiation error:', error);
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

      // Process notification
      const { orderId, paymentStatus } = await Payment.handleNotification(notification);

      res.json({
        status: 'success',
        message: `Payment status updated to ${paymentStatus} for order ${orderId}`
      });
    } catch (error) {
      console.error('Payment notification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process payment notification'
      });
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
      console.error('Get payment status error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get payment status'
      });
    }
  }
}

module.exports = PaymentController;