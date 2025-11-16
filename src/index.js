require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const { setupSecurity } = require('./middleware/security.js');
const { errorHandler, notFound } = require('./middleware/errorHandler.js');
const logger = require('./config/logger.js');

const productRoutes = require('./routes/productRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');

const app = express();

// Basic security middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (morgan -> logs/access.log and console in dev)
const setupRequestLogger = require('./middleware/logger');
setupRequestLogger(app);

// Setup additional security features
setupSecurity(app);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
const { authenticateToken } = require('./middleware/auth');
const { requireCustomer } = require('./middleware/auth');
const OrderController = require('./controllers/orderController');
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/cart', authenticateToken, cartRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);

// Backwards-compatible top-level checkout endpoint
app.post('/api/checkout', authenticateToken, requireCustomer, OrderController.createOrder);
// Mount payment routes WITHOUT global authentication because the payment gateway will call
// the notification/webhook endpoint without a token. Individual protected payment routes
// (initiatePayment, getPaymentStatus) are already protected inside `paymentRoutes`.
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fairy Garden API' });
});

// Handle 404 errors
app.use(notFound);

// Global error handling
app.use(errorHandler);

// Log unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  // Log full error for debugging
  logger.error({ name: err.name, message: err.message, stack: err.stack || err });
  console.error('Unhandled Rejection:', err.stack || err);
  process.exit(1);
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  // Log full error for debugging
  logger.error({ name: err.name, message: err.message, stack: err.stack || err });
  console.error('Uncaught Exception:', err.stack || err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});