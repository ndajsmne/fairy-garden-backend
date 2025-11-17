# Railway Environment Variables Setup

## Required Variables for Railway Deployment

Buka Railway Dashboard → Your Project → Variables tab, dan set:

### Database Configuration
- **DB_HOST**: `your-railway-db-host.railway.internal` (dari Railway MySQL plugin)
- **DB_USER**: `root` atau username yang Anda set
- **DB_PASSWORD**: password dari Railway MySQL
- **DB_NAME**: `fairy_garden_db`

### Application Configuration
- **NODE_ENV**: `production`
- **PORT**: `3000` (Railway auto-detect)

### JWT Configuration
- **JWT_SECRET**: use strong random key (e.g., generated from https://passwordsgenerator.net/)
- **JWT_EXPIRES_IN**: `24h`

### Midtrans (Payment Gateway)
- **MIDTRANS_SERVER_KEY**: dari Midtrans dashboard
- **MIDTRANS_CLIENT_KEY**: dari Midtrans dashboard
- **MIDTRANS_MERCHANT_ID**: dari Midtrans account

### Frontend CORS
- **FRONTEND_URL**: `https://fairygarden.vercel.app` (or your frontend domain)

## How to Get Database Credentials from Railway

1. Open Railway Dashboard
2. Select your Project → MySQL plugin
3. Under "Environment" or "Variables", copy:
   - `DATABASE_URL` → extract host/user/password
   - Or look for individual vars: `DB_HOST`, `DB_PASSWORD`, etc.

## Testing Connection

After setting variables, check Railway Logs:
- Railway Dashboard → Deployments → Latest → Logs
- Look for: `[DB] ✅ Connected to MySQL successfully`

If you see DB connection error, verify:
1. Credentials are correct
2. Database `fairy_garden_db` exists
3. Tables are migrated (run ALTER TABLE statements if needed)

## Database Schema Migrations

If deploy still shows 500 on `/api/products`, run these SQL statements in Railway SQL console:

```sql
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS handling_service_fee INT NOT NULL DEFAULT 10000;
ALTER TABLE orders MODIFY COLUMN delivery_fee INT NOT NULL DEFAULT 25000;
```

Then redeploy or restart the app.
