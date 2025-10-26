const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - nama
 *         - harga
 *         - deskripsi
 *         - stok
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated product ID
 *         nama:
 *           type: string
 *           description: Name of the product
 *         harga:
 *           type: number
 *           description: Price of the product
 *         deskripsi:
 *           type: string
 *           description: Product description
 *         stok:
 *           type: integer
 *           description: Available stock quantity
 *         gambar:
 *           type: string
 *           description: URL of the product image
 */

/**
 * @swagger
 * /api/produk:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Retrieve a list of all available products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get('/produk', ProductController.getAllProducts);

/**
 * @swagger
 * /api/produk/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/produk/:id', ProductController.getProductById);

/**
 * @swagger
 * /api/produk:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/produk', authenticateToken, requireAdmin, ProductController.createProduct);

/**
 * @swagger
 * /api/produk/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.put('/produk/:id', authenticateToken, requireAdmin, ProductController.updateProduct);

/**
 * @swagger
 * /api/produk/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.delete('/produk/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);

module.exports = router;