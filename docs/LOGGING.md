# Logging & Error Handling Documentation

## Overview

Fairy Garden API menggunakan **Winston** untuk structured logging dan **Morgan** untuk HTTP request logging. Semua log disimpan di folder `logs/` dengan format JSON untuk mudah di-parse dan analisis.

---

## 1. Log Files & Locations

### File Structure
```
/logs
├── error.log        # Error logs only (severity: error)
├── combined.log     # All logs (info, warn, error)
├── access.log       # HTTP request/response (Morgan)
└── payment.log      # Payment-specific logs (optional)
```

### Log Directory
- **Path:** `{project-root}/logs/`
- **Created automatically** on first log write
- **Retention:** No rotation by default (consider log rotation for production)

---

## 2. Log Format & Structure

### Winston (Error & Application Logs)

**Format:**
```json
{
  "timestamp": "2025-11-11 14:35:22",
  "level": "error",
  "message": "Payment initiation error",
  "stack": "Error: Midtrans API error...\n    at initiatePayment..."
}
```

**Fields:**
- `timestamp` — ISO format with milliseconds
- `level` — info, warn, error
- `message` — Log message or object
- `stack` — Stack trace (for errors)
- Additional context fields (see examples below)

### Morgan (HTTP Request Logs)

**Format (access.log):**
```
127.0.0.1 - 5 [2025-11-11T14:35:22Z] "POST /api/orders" 201 320 - 45ms
```

**Fields:**
- `remote-addr` — Client IP
- `user` — User ID (or "guest")
- `date[iso]` — Request timestamp
- `method` — HTTP method (GET, POST, etc.)
- `url` — Request path
- `status` — HTTP status code
- `res[content-length]` — Response size (bytes)
- `response-time` — Duration (milliseconds)

---

## 3. Error Response Format (JSON Consistency)

All error responses follow this format:

**Format:**
```json
{
  "status": "error" | "fail",
  "message": "Human-readable error description",
  "code": "ERROR_CODE" (optional),
  "details": {} (optional, for detailed errors)
}
```

**Status Codes:**
- `"fail"` — Client error (4xx)
- `"error"` — Server error (5xx)

**HTTP Status Code Mapping:**
| Code | Scenario | Response |
|------|----------|----------|
| 400 | Invalid input, validation error | `{"status": "fail", "message": "..."}` |
| 401 | Unauthorized, invalid token | `{"status": "fail", "message": "Invalid token"}` |
| 403 | Forbidden, insufficient permissions | `{"status": "fail", "message": "Forbidden"}` |
| 404 | Resource not found | `{"status": "fail", "message": "Not Found"}` |
| 500 | Internal server error | `{"status": "error", "message": "Something went wrong"}` |

**Examples:**

Validation Error (400):
```json
{
  "status": "fail",
  "message": "Validation failed"
}
```

Unauthorized (401):
```json
{
  "status": "fail",
  "message": "Invalid token. Please log in again."
}
```

Server Error (500):
```json
{
  "status": "error",
  "message": "Something went wrong!"
}
```

---

## 4. Error Handling Middleware

### Error Handler (`src/middleware/errorHandler.js`)

**Catches:**
1. **ER_DUP_ENTRY** (MySQL) — Duplicate key error
2. **ValidationError** — Input validation
3. **JsonWebTokenError** — Invalid JWT
4. **TokenExpiredError** — Expired JWT
5. **AppError** — Custom operational errors
6. **Unknown errors** — Logged but not exposed to client

**Flow:**
```
Error thrown → errorHandler middleware
    → Log full error (stack trace, context)
    → If operational: send user-friendly message
    → If unknown: send generic "Something went wrong"
```

### Custom AppError Class

**Usage:**
```javascript
const { AppError } = require('../middleware/errorHandler');

throw new AppError('Invalid product ID', 400);
// Response: 400 with status: 'fail', message: 'Invalid product ID'
```

**Constructor:**
```javascript
new AppError(message, statusCode)
```

---

## 5. Logging Levels & When to Use

| Level | Usage | Example |
|-------|-------|---------|
| **info** | Normal operations | "Order created", "Payment initiated" |
| **warn** | Warnings, unusual cases | "Low stock detected", "API rate limit approaching" |
| **error** | Errors that need attention | "Database connection failed", "Payment gateway error" |

**Configure Level in `.env`:**
```properties
LOG_LEVEL=info
```

---

## 6. How to Read & Parse Logs

### Option 1: View Logs in Terminal

**Real-time (dev mode):**
```bash
npm run dev
```
Logs print to console in `simple` format.

**Tail error log:**
```bash
# Windows PowerShell
Get-Content logs/error.log -Tail 20 -Wait

# Linux/Mac
tail -f logs/error.log
```

### Option 2: Parse JSON Logs (Programmatic)

**Read error log:**
```bash
# Pretty-print last 10 errors
cat logs/error.log | jq -s 'last(10)'

# Filter by timestamp
cat logs/error.log | jq 'select(.timestamp > "2025-11-11T14:00:00")'

# Extract error messages
cat logs/error.log | jq '.message'
```

**Using Node.js:**
```javascript
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('logs/error.log')
});

rl.on('line', (line) => {
  try {
    const log = JSON.parse(line);
    console.log(`[${log.timestamp}] ${log.message}`);
  } catch (e) {
    // Skip non-JSON lines
  }
});
```

### Option 3: View in GUI

**Using VS Code:**
1. Open `logs/error.log` in editor
2. Use find (Ctrl+F) to search by timestamp or error message

**Using log viewers:**
- Windows: Notepad++ (search/filter)
- Online: [JSON viewer](https://jsoncrack.com) (paste log content)

---

## 7. Common Errors & Troubleshooting

### Payment Errors

**Log Entry:**
```json
{
  "timestamp": "2025-11-11 15:30:45",
  "level": "error",
  "message": "Payment initiation error",
  "stack": "MidtransError: Midtrans API is returning API error...",
  "user": 5
}
```

**Solutions:**
1. Check `.env` — verify `MIDTRANS_SERVER_KEY` & `MIDTRANS_CLIENT_KEY` are valid
2. Check network — ensure outbound to Midtrans API is allowed
3. Check order — ensure order exists and user owns it

### Database Errors

**Log Entry:**
```json
{
  "timestamp": "2025-11-11 15:30:45",
  "level": "error",
  "message": "Unknown column 'shipping_address' in 'field list'",
  "stack": "Error: ER_BAD_FIELD_ERROR..."
}
```

**Solutions:**
1. Verify database schema — run migration/setup script
2. Check column names — ensure code matches DB schema
3. Restart server — pick up schema changes

### Auth Errors

**Log Entry:**
```json
{
  "timestamp": "2025-11-11 15:30:45",
  "level": "error",
  "message": "Invalid token",
  "user": "unauthenticated"
}
```

**Solutions:**
1. Check JWT token — ensure it's valid and not expired
2. Check secret — verify `JWT_SECRET` in `.env`
3. Refresh token — user should login again

---

## 8. Log Rotation & Cleanup (Production)

### Current Setup (Development)
- Logs grow indefinitely
- No automatic cleanup

### Recommended for Production

Install `winston-daily-rotate-file`:
```bash
npm install winston-daily-rotate-file
```

**Update `src/config/logger.js`:**
```javascript
const WinstonDailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
  transports: [
    new WinstonDailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxDays: '14d' // Keep 14 days
    }),
    new WinstonDailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d'
    })
  ]
});
```

---

## 9. Monitoring & Alerts (Future)

### Log Aggregation Services
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Datadog** — Log aggregation + alerts
- **Sentry** — Error tracking & alerting
- **Splunk** — Log analysis platform

### Setup Example (Datadog)
```javascript
// Install: npm install node-datadog-logger
const datadog = require('node-datadog-logger');

datadog.init({
  api_key: process.env.DATADOG_API_KEY,
  app_key: process.env.DATADOG_APP_KEY,
  hostname: 'fairy-garden-api'
});

logger.add(new datadog.DatadogTransport({
  level: 'error'
}));
```

---

## 10. Quick Reference: Environment Variables

```properties
# Logger Configuration
LOG_LEVEL=info              # Options: error, warn, info, debug
NODE_ENV=development        # Options: development, production

# Midtrans (for payment logging)
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
```

---

## 11. Checklist: Error Handling & Logging Verification

- [ ] All errors return JSON with consistent format (status, message)
- [ ] Error HTTP status codes are correct (4xx vs 5xx)
- [ ] Errors logged with full context (user, URL, method, body)
- [ ] Stack traces logged in error.log (not exposed to client)
- [ ] Morgan access logs written to logs/access.log
- [ ] Winston combined logs written to logs/combined.log
- [ ] Console logs colorized in development
- [ ] Unhandled rejections caught and logged
- [ ] Uncaught exceptions caught and logged
- [ ] LOG_LEVEL environment variable configurable
- [ ] logs/ directory auto-created on first run
- [ ] No sensitive data (passwords, tokens) logged in plain text

---

## 12. Example: Reading Logs for Debugging

### Scenario 1: Track User's Order Creation

**Command:**
```bash
# Find all logs for user ID 5
cat logs/combined.log | jq 'select(.user == 5 or .user == "5")'
```

**Output:**
```json
{
  "timestamp": "2025-11-11 15:30:22",
  "level": "info",
  "message": "[Order Model] Getting orders for user: 5",
  "user": 5
}
{
  "timestamp": "2025-11-11 15:30:25",
  "level": "error",
  "message": "Cart is empty",
  "user": 5,
  "url": "/api/orders",
  "method": "POST"
}
```

### Scenario 2: Debug Payment Failures

**Command:**
```bash
# Find all payment errors in last 1 hour
cat logs/error.log | jq 'select(.message | contains("Payment"))'
```

**Output:**
```json
{
  "timestamp": "2025-11-11 15:31:18",
  "level": "error",
  "message": "Payment initiation error",
  "stack": "MidtransError: Access denied due to unauthorized transaction...",
  "user": 5
}
```

**Action:** Check Midtrans keys in `.env`, verify user has valid order, retry request.

---

## 13. Support & Questions

For issues with logging or error handling:
1. Check logs in `logs/` folder
2. Review stack trace for error details
3. Check `.env` configuration
4. Verify database schema alignment
5. Contact development team with log excerpt

---

**Last Updated:** November 11, 2025
**Version:** 1.0
