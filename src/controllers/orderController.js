const Order = require('../models/order');

class OrderController {
  // Create new order from cart
  static async createOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { shippingAddress } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({
          status: 'error',
          message: 'Shipping address is required'
        });
      }

      const { orderId, totalAmount } = await Order.createFromCart(userId, shippingAddress);

      res.status(201).json({
        status: 'success',
        data: {
          orderId,
          totalAmount,
          message: 'Order created successfully'
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(error.message.includes('stock') ? 400 : 500).json({
        status: 'error',
        message: error.message || 'Failed to create order'
      });
    }
  }

  // Get user's orders
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.userId;
      const orders = await Order.getUserOrders(userId);

      res.json({
        status: 'success',
        data: orders
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve orders'
      });
    }
  }

  // Get single order
  static async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.role === 'admin' ? null : req.user.userId;
      
      const order = await Order.getOrderById(orderId, userId);
      
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }

      res.json({
        status: 'success',
        data: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve order'
      });
    }
  }

  // Update order status (admin only)
  static async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }

      const updated = await Order.updateStatus(orderId);
      
      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(error.message.includes('Invalid') ? 400 : 500).json({
        status: 'error',
        message: error.message || 'Failed to update order status'
      });
    }
  }

  // Get all orders (admin only)
  static async getAllOrders(req, res) {
    try {
      const orders = await Order.getAllOrders();

      res.json({
        status: 'success',
        data: orders
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve orders'
      });
    }
  }

  // Cancel order (customer only)
  static async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.userId;

      const updated = await Order.updateStatus(orderId, 'cancelled', userId);
      
      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found or cannot be cancelled'
        });
      }

      res.json({
        status: 'success',
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to cancel order'
      });
    }
  }
}

module.exports = OrderController;