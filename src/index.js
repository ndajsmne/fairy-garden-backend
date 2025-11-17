require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const { setupSecurity } = require('./middleware/security.js');
const { errorHandler, notFound } = require('./middleware/errorHandler.js');
const logger = require('./config/logger.js');

// Route modules
const productRoutes = require('./routes/productRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');

const { authenticateToken, requireCustomer } = require('./middleware/auth');
const OrderController = require('./controllers/orderController');
const setupRequestLogger = require('./middleware/logger');

const app = express();

// ---- CORS configuration -------------------------------------------------
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://fairygarden.vercel.app"
  ],
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

// ---- Security + parsing -----------------------------------------------
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (morgan -> logs/access.log and console in dev)
setupRequestLogger(app);

// Additional security features
setupSecurity(app);

// ---- API docs ---------------------------------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- Public routes ----------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes); // payment webhooks may be public
app.use('/api/categories', categoryRoutes);

// ---- Protected routes -------------------------------------------------
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/cart', authenticateToken, cartRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);

// Backwards-compatible checkout endpoint
app.post('/api/checkout', authenticateToken, requireCustomer, OrderController.createOrder);

// Basic route for testing
app.get('/', (req, res) => res.json({ message: 'Welcome to Fairy Garden API' }));

// ---- Error handlers --------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---- Process-level error logging -------------------------------------
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error({ name: err.name, message: err.message, stack: err.stack || err });
  console.error('Unhandled Rejection:', err.stack || err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error({ name: err.name, message: err.message, stack: err.stack || err });
  console.error('Uncaught Exception:', err.stack || err);
  process.exit(1);
});

// ---- Start server ----------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));