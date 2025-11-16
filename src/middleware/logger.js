const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Create a stream object with a write function that will be used by `morgan`
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

// Morgan token for user id if present
morgan.token('user', (req) => (req.user ? req.user.userId : 'guest'));

// Combined format to file, and concise to console
const morganMiddleware = morgan(':remote-addr - :user [:date[iso]] ":method :url" :status :res[content-length] - :response-time ms', {
  stream: accessLogStream
});

// Also log to console in dev
const morganConsole = morgan('dev');

module.exports = (app) => {
  app.use(morganMiddleware);
  app.use(morganConsole);
};
