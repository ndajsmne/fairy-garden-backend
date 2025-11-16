const Order = require('../models/order');

class OrderController {
  // Create new order from cart
  static async createOrder(req, res) {
    try {
      const userId = req.user.userId;
      // Accept both a shippingAddress object and top-level delivery fields
      const {
        shippingAddress,
        deliveryMethod,
        deliveryDate,
        deliveryTime,
        recipientName,
        recipientPhone,
        senderName,
        senderPhone,
        cardMessage,
        cardFrom,
        cardTo
      } = req.body;

      // shippingAddress is required and must be an object
      if (!shippingAddress || typeof shippingAddress !== 'object') {
        return res.status(400).json({
          status: 'error',
          message: 'Shipping address object is required'
        });
      }

      // Validate minimal shipping address structure (address, postalCode, province)
      const { address, city, postalCode, province } = shippingAddress;
      if (!address || !postalCode || !province) {
        return res.status(400).json({
          status: 'error',
          message: 'Shipping address must include address, postalCode, and province'
        });
      }

      const orderPayload = {
        deliveryMethod,
        deliveryDate,
        deliveryTime,
        recipientName,
        recipientPhone,
        senderName,
        senderPhone,
        cardMessage,
        cardFrom,
        cardTo
      };

      const { orderId, totalAmount } = await Order.createFromCart(userId, shippingAddress, orderPayload);

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
      console.log('[OrderController] Getting orders for user:', userId);
      
      const orders = await Order.getUserOrders(userId);
      console.log('[OrderController] Retrieved orders:', orders);

      res.json({
        status: 'success',
        data: orders
      });
    } catch (error) {
      console.error('Get user orders error:', error.stack || error);
      res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to retrieve orders'
      });
    }
  }

  // Get single order
  static async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.role === 'admin' ? null : req.user.userId;
      
      console.log('[OrderController] Getting order:', { orderId, userId, userRole: req.user.role });
      
      const order = await Order.getOrderById(orderId, userId);
      console.log('[OrderController] Retrieved order:', order);
      
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
      console.error('[OrderController] Get order error:', error.stack || error);
      res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to retrieve order'
      });
    }
  }

  // Update order status (admin only)
  static async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      console.log('[OrderController] Updating order status:', { orderId, newStatus: status });

      // Validate status
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }

      // Validate status value
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Update the order
      const updated = await Order.updateStatus(orderId, status);
      
      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }

      // Get updated order details
      const order = await Order.getOrderById(orderId);

      res.json({
        status: 'success',
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      console.error('[OrderController] Update order status error:', error.stack || error);
      res.status(error.message.includes('Invalid') ? 400 : 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to update order status'
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