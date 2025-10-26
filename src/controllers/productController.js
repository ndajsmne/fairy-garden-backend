const Product = require('../models/product');

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
      const products = await Product.getAll();
      res.json({
        status: 'success',
        data: products
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch products'
      });
    }
  }

  // Get a single product by ID
  static async getProductById(req, res) {
    try {
      const product = await Product.getById(req.params.id);
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