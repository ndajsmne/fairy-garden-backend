const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const { initiatePaymentValidator, getPaymentStatusValidator, simulateNotificationValidator } = require('../validators/paymentValidator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         orderId:
 *           type: integer
 *           description: ID of the order being paid
 *         amount:
 *           type: number
 *           description: Payment amount
 *         status:
 *           type: string
 *           enum: [pending, success, failed, expired]
 *           description: Payment status
 *         paymentToken:
 *           type: string
 *           description: Payment token from Midtrans
 *         redirectUrl:
 *           type: string
 *           description: URL to payment gateway
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders/{orderId}/pay:
 *   post:
 *     summary: Initiate payment for an order
 *     tags: [Payments]
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
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 *       404:
 *         description: Order not found
 *       400:
 *         description: Order already paid or invalid status
 */
router.post('/orders/:orderId/pay', authenticateToken, requireCustomer, initiatePaymentValidator, PaymentController.initiatePayment);

/**
 * @swagger
 * /api/orders/{orderId}/payment-status:
 *   get:
 *     summary: Get payment status for an order
 *     tags: [Payments]
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
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order or payment not found
 */
router.get('/orders/:orderId/payment-status', authenticateToken, getPaymentStatusValidator, PaymentController.getPaymentStatus);

/**
 * @swagger
 * /api/payment-notification:
 *   post:
 *     summary: Handle payment notification from Midtrans
 *     tags: [Payments]
 *     description: This endpoint is called by Midtrans to update payment status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_status:
 *                 type: string
 *               order_id:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment notification processed successfully
 *       400:
 *         description: Invalid notification data
 */
router.post('/payment-notification', PaymentController.handleNotification);

// Test-only: simulate payment notification from gateway
router.post('/simulate-notification', simulateNotificationValidator, PaymentController.simulateNotification);

module.exports = router;