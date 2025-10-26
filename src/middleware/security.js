const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const logger = require('../config/logger');

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});

// API specific limiter
const apiLimiter = rateLimit({
  max: 20, // limit each IP to 20 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests for this API endpoint, please try again later.'
});

// Custom morgan token for logging user ID
morgan.token('user', (req) => {
  return req.user ? req.user.userId : 'unauthenticated';
});

// Request logging middleware
const requestLogger = morgan(
  ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }
);

// Sanitize data middleware
const sanitizeData = (req, res, next) => {
  if (req.body) {
    // Sanitize each field in the request body
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

// Security middleware setup function
const setupSecurity = (app) => {
  // Rate limiting
  app.use('/api/', limiter);
  app.use('/api/auth/', apiLimiter);

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'price',
      'stock',
      'status',
      'role'
    ]
  }));

  // Request logging
  app.use(requestLogger);

  // Data sanitization
  app.use(sanitizeData);
};

module.exports = {
  setupSecurity,
  limiter,
  apiLimiter,
  requestLogger,
  sanitizeData
};