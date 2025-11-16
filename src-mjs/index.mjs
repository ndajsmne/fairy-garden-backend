import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pool from './config/database.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Mount CommonJS routes from the main src folder
const authRoutes = require('../src/routes/authRoutes');

const app = express();

// Basic security middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging middleware (for debugging Postman 404)
app.use((req, res, next) => {
  try {
    const safeHeaders = {
      host: req.headers.host,
      'content-type': req.headers['content-type'] || req.headers['Content-Type'] || '',
      authorization: req.headers.authorization ? '<<present>>' : '<<absent>>'
    };
    console.log(`[REQ] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Headers:`, safeHeaders);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('[REQ BODY]', req.body);
    }
  } catch (e) {
    console.log('[REQ LOG ERROR]', e.message);
  }
  next();
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fairy Garden API' });
});

// Mount authentication routes (from CommonJS codebase)
app.use('/api/auth', authRoutes);

// Error handling
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Not Found - ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});