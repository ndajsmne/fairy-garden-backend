const Cart = require('../models/cart');

class CartController {
  // Get user's cart
  static async getCart(req, res) {
    try {
      const userId = req.user.userId;
      const cartItems = await Cart.getCartItems(userId);
      const total = await Cart.getCartTotal(userId);

      res.json({
        status: 'success',
        data: {
          items: cartItems,
          total: total
        }
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve cart items'
      });
    }
  }

  // Add item to cart
  static async addToCart(req, res) {
    try {
      const userId = req.user.userId;
      const { product_id, quantity = 1 } = req.body;

      if (!product_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Product ID is required'
        });
      }

      const cartItem = await Cart.addItem(userId, product_id, quantity);

      res.status(201).json({
        status: 'success',
        data: cartItem,
        message: 'Item added to cart successfully'
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(error.message.includes('stock') ? 400 : 500).json({
        status: 'error',
        message: error.message || 'Failed to add item to cart'
      });
    }
  }

  // Update cart item quantity
  static async updateCartItem(req, res) {
    try {
      const userId = req.user.userId;
      const { cartItemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid quantity is required'
        });
      }

      const updated = await Cart.updateItemQuantity(userId, cartItemId, quantity);

      if (updated) {
        res.json({
          status: 'success',
          message: 'Cart item updated successfully'
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'Cart item not found'
        });
      }
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(error.message.includes('stock') ? 400 : 500).json({
        status: 'error',
        message: error.message || 'Failed to update cart item'
      });
    }
  }

  // Remove item from cart
  static async removeFromCart(req, res) {
    try {
      const userId = req.user.userId;
      const { cartItemId } = req.params;

      const removed = await Cart.removeItem(userId, cartItemId);

      if (removed) {
        res.json({
          status: 'success',
          message: 'Item removed from cart successfully'
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'Cart item not found'
        });
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to remove item from cart'
      });
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    try {
      const userId = req.user.userId;
      await Cart.clearCart(userId);

      res.json({
        status: 'success',
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to clear cart'
      });
    }
  }
}

module.exports = CartController;