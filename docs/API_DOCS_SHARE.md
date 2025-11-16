# API Documentation & Sharing Guide

This file explains how to access the API docs and share them with the front-end team.

## API Docs (Swagger UI)
- URL (development): http://localhost:3000/api-docs
- The server serves OpenAPI generated from JSDoc in `src/routes/*.js` via `src/config/swagger.js`.

## How to export Postman collection
1. Open Swagger UI at `/api-docs` and click the "Export" or "Download" button (if available), or use the Postman Import feature with the Swagger JSON URL:
   - Swagger JSON URL: http://localhost:3000/api-docs/v1.json (or the JSON link shown on the page)
2. In Postman: `Import` → `Link` → paste the Swagger JSON URL → Import
3. Save the collection and share via Postman workspace or export the collection JSON file and attach to ClickUp task.

## Recommended share flow
- Export Postman collection and attach to ClickUp task: `Payment Gateway Integration — Postman Collection`
- Add link to Swagger UI in ClickUp description: `http://staging.example.com/api-docs` (production/staging as available)
- Add a short markdown snippet for front-end to get started (auth token generation, example requests)

## Example snippet for front-end usage
```
# Authentication
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "<JWT_TOKEN>" }

# Use token in Authorization header:
Authorization: Bearer <JWT_TOKEN>
```

## Update process
- Whenever a public API contract changes (route path, required body, response shape), update JSDoc comments in `src/routes/*.js` and re-run the server. The Swagger UI will reflect changes automatically.
- Export new Postman collection and notify the front-end team via ClickUp or Slack.

---

For any issues, contact backend team or open an issue in the project tracker.
