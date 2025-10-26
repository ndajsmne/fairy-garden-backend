const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fairy Garden API Documentation',
    version: '1.0.0',
    description: 'Documentation for Fairy Garden florist e-commerce API',
    contact: {
      name: 'Fairy Garden Support',
      email: 'support@fairygarden.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;