require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { setupSecurity } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Basic security middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Setup additional security features
setupSecurity(app);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);

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
  logger.error(err.name, err.message);
  process.exit(1);
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});