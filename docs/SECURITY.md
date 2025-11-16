# Security Hardening & Testing Guide

This document describes the changes made to harden the API and how to test them locally.

## Installed / Required Packages
- helmet
- express-rate-limit
- xss-clean
- hpp
- express-validator
- express-mongo-sanitize (optional)
- autocannon (dev dependency for stress testing)
- axios (for test scripts)

Install with:

```bash
npm install helmet express-rate-limit xss-clean hpp express-validator express-mongo-sanitize axios
npm install --save-dev autocannon
```

## What was implemented

1. **Global rate limiter** updated to 100 requests per minute (see `src/middleware/security.js`).
2. **API-specific limiter** for auth endpoints (tighter limits).
3. **XSS sanitization** via `xss-clean` and a custom sanitizer that trims string fields.
4. **HPP** to prevent parameter pollution with a small whitelist.
5. **JWT middleware enhanced**: handles token expiry and invalid token responses; supports token revocation via `src/utils/tokenBlacklist.js`.
6. **Route-level validation** using `express-validator` for `POST /api/orders` (see `src/validators/orderValidator.js`).
7. **Test scripts** added:
   - `scripts/test-xss.js` — sends XSS payloads
   - `scripts/stress-rate-limit.js` — uses `autocannon` to generate high request volume

## How to test locally

1. Install packages (see above).
2. Start server:

```bash
npm run dev
```

3. Run XSS test (set a valid TOKEN env var or leave empty to test auth rejection):

```bash
TOKEN=<your_jwt_token> node scripts/test-xss.js
```

4. Run stress test (autocannon):

```bash
node scripts/stress-rate-limit.js http://localhost:3000/api/orders
```

Watch server logs and `logs/access.log` / `logs/error.log` for rate limit responses and sanitized output.

## Notes and Recommendations
- For production, use a central token revocation store (Redis) rather than file-based persistence.
- Mask PII in logs and avoid logging tokens/credit card numbers.
- Add monitoring/alerts for rate-limit spikes and repeated invalid token attempts.

***

This guide is a quick reference — all code changes are in the repository and documented in the inline code comments.
