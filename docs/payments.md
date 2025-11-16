# Payment Gateway Integration (Sandbox)

This document explains how to setup sandbox credentials and test the payment flow (using Midtrans as example). The project already expects Midtrans keys in `.env`:

- MIDTRANS_SERVER_KEY
- MIDTRANS_CLIENT_KEY
- MIDTRANS_MERCHANT_ID

1) Setup sandbox account

- Register at Midtrans (https://midtrans.com) and create a sandbox account.
- Copy the sandbox server key and client key into your project's `.env` file. Example:

```
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxx
MIDTRANS_MERCHANT_ID=G12345678
```

2) Start the server

```
npm install
npm run dev
```

3) Initiate a payment (customer)

- Use Postman collection `.postman/fairy-garden-payments.postman_collection.json`.
- Request: POST /api/orders/:orderId/pay (Authorization: Bearer <jwt>)
- Response: { token } — open token in Midtrans Snap (if front-end) or follow redirectUrl returned by gateway.

4) Simulate payment notification (gateway -> callback)

- Midtrans will call your notification endpoint (webhook) at `/api/payments/payment-notification`.
- To test locally, use Postman and call that endpoint with a JSON body sample (see Postman collection):

```
{
  "order_id": "ORDER-1",
  "transaction_status": "settlement",
  "transaction_id": "TRANS-12345"
}
```

- The server will update `payments.status` and `orders.payment_status` accordingly.

5) Verify

- GET /api/orders/:orderId/payment-status (authenticated) — should show updated payment record.
- Check logs: `logs/access.log` for the webhook request, `logs/combined.log` for processing details, `logs/error.log` for errors.

Notes
- This code uses `midtrans-client` package and expects valid sandbox keys. In production set `NODE_ENV=production` and use production keys.
- If using a local machine, consider using a tunnelling tool (ngrok) to expose your local `payment-notification` endpoint to middleware for real gateway callbacks.
