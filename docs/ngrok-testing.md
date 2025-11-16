# Testing Payment Gateway Callbacks with ngrok

This guide shows how to use ngrok to test payment gateway callbacks locally.

## Setup ngrok

1. Download ngrok from https://ngrok.com/download
2. Extract the zip file
3. Sign up for a free account and get your auth token
4. Run in terminal:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Expose Local Server

1. Start your Node.js server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL that ngrok gives you (e.g., https://1234-your-tunnel.ngrok.io)

## Configure Gateway

1. Go to Midtrans Dashboard → Settings → Configuration
2. Set Payment Notification URL to:
   ```
   https://your-ngrok-url/api/payments/payment-notification
   ```

## Test with curl

### Success Payment:
```bash
curl -X POST https://your-ngrok-url/api/payments/payment-notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER-1",
    "transaction_status": "settlement",
    "transaction_id": "TRANS-12345"
  }'
```

### Failed Payment:
```bash
curl -X POST https://your-ngrok-url/api/payments/payment-notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER-1",
    "transaction_status": "deny",
    "transaction_id": "TRANS-12345"
  }'
```

## Verify

1. Check the order status:
   ```bash
   curl -X GET https://your-ngrok-url/api/orders/1/payment-status \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

2. Check logs:
   - logs/access.log - Look for POST /api/payments/payment-notification
   - logs/combined.log - Look for payment processing details
   - ngrok web interface (http://localhost:4040) - See all requests

## Notes

- The free version of ngrok will give you a new URL each time you restart it
- Keep the ngrok terminal window open while testing
- Check the ngrok web interface (http://localhost:4040) to inspect webhooks
- In production, use real SSL and a proper domain name