const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin, requireCustomer } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated order ID
 *         userId:
 *           type: integer
 *           description: ID of the user who placed the order
 *         total:
 *           type: number
 *           description: Total order amount
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *           description: Order status
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order from cart items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Empty cart or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.post('/orders', requireCustomer, OrderController.createOrder);
/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get authenticated user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.get('/orders/my-orders', requireCustomer, OrderController.getUserOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', OrderController.getOrder);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 *       404:
 *         description: Order not found
 *       400:
 *         description: Order cannot be cancelled
 */
router.post('/orders/:orderId/cancel', requireCustomer, OrderController.cancelOrder);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/admin/orders', requireAdmin, OrderController.getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{orderId}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.put('/admin/orders/:orderId/status', requireAdmin, OrderController.updateOrderStatus);

module.exports = router;