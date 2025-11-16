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
router.get('/', ProductController.getProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products for homepage
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of featured products
 */
router.get('/featured', ProductController.getFeaturedProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID with related products
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details with related products
 *       404:
 *         description: Product not found
 */
router.get('/:id', ProductController.getProduct);

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
router.post('/', authenticateToken, requireAdmin, ProductController.createProduct);

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
router.put('/:id', authenticateToken, requireAdmin, ProductController.updateProduct);

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
router.delete('/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/related:
 *   post:
 *     summary: Add a related product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - relatedProductId
 *             properties:
 *               relatedProductId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Related product added successfully
 *       400:
 *         description: Products are already related or invalid product IDs
 */
router.post('/:id/related', authenticateToken, requireAdmin, ProductController.addRelatedProduct);

/**
 * @swagger
 * /api/products/{id}/related/{relatedId}:
 *   delete:
 *     summary: Remove a related product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: relatedId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Related product removed successfully
 *       404:
 *         description: Related product not found
 */
router.delete('/:id/related/:relatedId', authenticateToken, requireAdmin, ProductController.removeRelatedProduct);

module.exports = router;