const Product = require('../models/product');

class ProductController {
  // Get all products with filtering and sorting
  static async getProducts(req, res) {
    try {
      const {
        search,
        category,
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        page,
        limit
      } = req.query;

      const result = await Product.getAll({
        search,
        category,
        sortBy,
        sortOrder,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12
      });

      res.json(result);
    } catch (error) {
      console.error('[ProductController.getProducts] Error:', error.message);
      res.status(500).json({
        error: error.message,
        status: 'error'
      });
    }
  }

  // Get featured products for homepage
  static async getFeaturedProducts(req, res) {
    try {
      const products = await Product.getFeatured();
      
      res.json({ items: products });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Get single product with related products
  static async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getById(id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      res.json({
        status: 'success',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Add related product
  static async addRelatedProduct(req, res) {
    try {
      const { id } = req.params;
      const { relatedProductId } = req.body;

      const success = await Product.addRelatedProduct(id, relatedProductId);

      if (!success) {
        return res.status(400).json({
          status: 'error',
          message: 'Products are already related or invalid product IDs'
        });
      }

      res.json({
        status: 'success',
        message: 'Related product added successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Remove related product
  static async removeRelatedProduct(req, res) {
    try {
      const { id, relatedId } = req.params;

      const success = await Product.removeRelatedProduct(id, relatedId);

      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Related product not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Related product removed successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getById(id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      res.json({
        status: 'success',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch product'
      });
    }
  }

  // Create a new product
  static async createProduct(req, res) {
    try {
      const { name, description, price, stock, image_url, category } = req.body;
      
      // Basic validation
      if (!name || !price) {
        return res.status(400).json({
          status: 'error',
          message: 'Name and price are required'
        });
      }

      const product = await Product.create({
        name,
        description,
        price,
        stock: stock || 0,
        image_url,
        category
      });

      res.status(201).json({
        status: 'success',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create product'
      });
    }
  }

  // Update a product
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock, image_url, category } = req.body;

      const exists = await Product.getById(id);
      if (!exists) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      const updated = await Product.update(id, {
        name,
        description,
        price,
        stock,
        image_url,
        category
      });

      if (updated) {
        res.json({
          status: 'success',
          message: 'Product updated successfully'
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to update product'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update product'
      });
    }
  }

  // Delete a product
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const exists = await Product.getById(id);
      if (!exists) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      const deleted = await Product.delete(id);
      
      if (deleted) {
        res.json({
          status: 'success',
          message: 'Product deleted successfully'
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to delete product'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete product'
      });
    }
  }
}

module.exports = ProductController;