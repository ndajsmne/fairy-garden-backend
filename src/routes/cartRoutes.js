const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticateToken, requireCustomer } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated cart item ID
 *         productId:
 *           type: integer
 *           description: ID of the product
 *         quantity:
 *           type: integer
 *           description: Quantity of the product
 *         product:
 *           $ref: '#/components/schemas/Product'
 */

// All cart routes require authentication and customer role
router.use(authenticateToken);
router.use(requireCustomer);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.get('/cart', CartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.post('/cart/add', CartController.addToCart);

/**
 * @swagger
 * /api/cart/update/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 *       404:
 *         description: Cart item not found
 */
router.put('/cart/update/:cartItemId', CartController.updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 *       404:
 *         description: Cart item not found
 */
router.delete('/cart/remove/:cartItemId', CartController.removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.delete('/cart/clear', CartController.clearCart);

module.exports = router;