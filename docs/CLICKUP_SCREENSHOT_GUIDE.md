# ClickUp Documentation: Payment Gateway & Error Handling — Screenshot Checklist

## 📸 Screenshot Checklist for ClickUp (Complete End-to-End Testing)

**Total Screenshots Required:** 6-7  
**Each screenshot should show:** Request URL + Body + Response  
**Tool:** Postman (already configured)

---

## 📋 Testing Flow Screenshots (In Order)

### Screenshot 1️⃣: Add to Cart
**Endpoint:** `POST /api/cart`  
**Request:**
```
Header: Authorization: Bearer {{user_token}}
Body: {
  "product_id": 1,
  "quantity": 2
}
```
**Expected Response:** 
```json
{
  "status": "success",
  "data": {
    "cartId": 5,
    "product": {...},
    "quantity": 2
  }
}
```
**Label for ClickUp:** "✅ Add to Cart (201 Created)"

---

### Screenshot 2️⃣: Create Order (Success)
**Endpoint:** `POST /api/orders`  
**Request:**
```
Header: Authorization: Bearer {{user_token}}
Body: {
  "shippingAddress": {
    "address": "Jl. Example No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345"
  },
  "deliveryMethod": "delivery",
  "deliveryDate": "2025-11-15",
  "deliveryTime": "14:00",
  "recipientName": "Jane Doe",
  "recipientPhone": "081234567891",
  "senderName": "John Doe",
  "senderPhone": "081234567890",
  "cardMessage": "Happy Birthday!",
  "cardFrom": "John",
  "cardTo": "Jane"
}
```
**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "orderId": 4,
    "totalAmount": 50000
  }
}
```
**Label for ClickUp:** "✅ Create Order (201 Created, Order ID: 4)"

---

### Screenshot 3️⃣: Create Order (Error — Empty Cart)
**Endpoint:** `POST /api/orders`  
**Request:**
```
Header: Authorization: Bearer {{user_token}}
Body: (same as above, but cart is empty)
```
**Expected Response (Error):**
```json
{
  "status": "fail",
  "message": "Cart is empty"
}
```
**HTTP Status:** 400  
**Label for ClickUp:** "✅ Error Handling — Empty Cart (400 Bad Request)"  
**Note:** Demonstrates error middleware working correctly with consistent JSON format

---

### Screenshot 4️⃣: Initiate Payment (Midtrans Token)
**Endpoint:** `POST /api/payments/orders/4/pay`  
**Request:**
```
Header: Authorization: Bearer {{user_token}}
Body: (empty)
```
**Expected Response (Success):**
```json
{
  "status": "success",
  "data": {
    "token": "d256dcee-456b-4432-bfed-f31c5a697235",
    "orderId": 4
  }
}
```
**HTTP Status:** 200  
**Label for ClickUp:** "✅ Initiate Payment — Midtrans Token Generated"  
**Note:** Token can be used by front-end to open Midtrans Snap payment page

---

### Screenshot 5️⃣: Simulate Payment Notification
**Endpoint:** `POST /api/payments/simulate-notification`  
**Request:**
```
Header: Content-Type: application/json
Body: {
  "order_id": "ORDER-4",
  "transaction_status": "settlement",
  "transaction_id": "TRX-20251111-001",
  "fraud_status": "accept"
}
```
**Expected Response (Success):**
```json
{
  "status": "success",
  "message": "Simulated payment status updated to completed for order 4"
}
```
**HTTP Status:** 200  
**Label for ClickUp:** "✅ Simulate Payment Notification (Updates DB)"  
**Note:** Simulates Midtrans webhook callback locally

---

### Screenshot 6️⃣: Check Payment Status
**Endpoint:** `GET /api/payments/orders/4/payment-status`  
**Request:**
```
Header: Authorization: Bearer {{user_token}}
Body: (empty)
```
**Expected Response (After Simulation):**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "order_id": 4,
    "amount": 50000,
    "status": "completed",
    "transaction_id": "TRX-20251111-001"
  }
}
```
**HTTP Status:** 200  
**Label for ClickUp:** "✅ Payment Status — Completed (Updated from Simulation)"  
**Note:** Confirms payment status updated by notification simulation

---

### Screenshot 7️⃣: (Optional) Unauthorized Error
**Endpoint:** `POST /api/orders`  
**Request:**
```
Header: Authorization: Bearer invalid_token_12345abcde
Body: {
  "shippingAddress": {
    "address": "Jl. Example No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345"
  },
  "deliveryMethod": "delivery",
  "deliveryDate": "2025-11-15",
  "deliveryTime": "14:00",
  "recipientName": "Jane Doe",
  "recipientPhone": "081234567891",
  "senderName": "John Doe",
  "senderPhone": "081234567890",
  "cardMessage": "Happy Birthday!",
  "cardFrom": "John",
  "cardTo": "Jane"
}
```
**Expected Response (Error):**
```json
{
  "status": "fail",
  "message": "Invalid token. Please log in again."
}
```
**HTTP Status:** 401  
**Label for ClickUp:** "✅ Error Handling — Invalid Token (401 Unauthorized)"  
**Note:** Demonstrates JWT error handling — body sama seperti order normal, tapi Authorization header diisi dengan token invalid/fake

---

## 📝 ClickUp Task Template

```
Task Title: Payment Gateway & Error Handling — End-to-End Testing ✅

Description:
Complete end-to-end testing of payment gateway integration (Midtrans) 
and error handling middleware using Postman.

All requests and responses verified in Postman. Screenshots show:
- Complete order flow (add cart → create order → initiate payment)
- Payment notification simulation (local webhook testing)
- Status verification
- Error handling (empty cart, invalid token)

Testing Completed:
✅ Cart operations working
✅ Order creation with shippingAddress payload
✅ Midtrans token generation successful
✅ Payment notification simulation working
✅ Status endpoint returns updated payment status
✅ Error responses in consistent JSON format
✅ HTTP status codes correct (4xx vs 5xx)

Attachments: (Add these 6-7 Postman screenshots in this order)
1. Add to Cart — POST /api/cart (201 Created)
2. Create Order — POST /api/orders (201 Created, Order ID: 4)
3. Create Order Error — POST /api/orders (400 Empty Cart) — Error Handling Demo
4. Initiate Payment — POST /api/payments/orders/4/pay (200 Token Generated)
5. Simulate Notification — POST /api/payments/simulate-notification (200 DB Updated)
6. Check Status — GET /api/payments/orders/4/payment-status (200 Completed)
7. (Optional) Invalid Token Error — POST /api/orders (401 Unauthorized) — Error Handling Demo

Testing Environment:
- Server: npm run dev (running on localhost:3000)
- Database: fairy_garden_db (MySQL)
- Midtrans: Sandbox mode (keys configured in .env)
- Postman Collection: postman/Fairy_Garden_API.postman_collection.json

Status: Complete ✅
```

---

## 🎯 How to Screenshot in Postman

### For Each Request:
1. Open Postman
2. Select request from collection (e.g., "Add to Cart")
3. Click "Send"
4. Take screenshot showing:
   - Request URL + Method (top)
   - Headers tab (showing Authorization)
   - Body tab (showing request payload)
   - Response body (showing success/error response)
   - Status code (top right, e.g., "200 OK")

### Quick Tip:
Use Postman's "Request" and "Response" tabs visible in same view:
- Left side: Request details
- Right side: Response
- Zoom out (Ctrl + Mouse wheel) to fit both in one screenshot

---

## 📚 Documentation Files (Already Created — No Screenshots Needed)

These files are in the repo and ready for reference:
- ✅ `docs/LOGGING.md` — 13 sections on logging & error handling
- ✅ `docs/ERROR_HANDLING_AUDIT.md` — Technical audit report
- ✅ `src/middleware/errorHandler.js` — Source code
- ✅ `src/config/logger.js` — Logger configuration

**Note:** These don't need to be screenshotted for ClickUp. Postman screenshots + file links are sufficient.

---

## ✅ Final ClickUp Submission Checklist

Before uploading to ClickUp:

- [ ] 6-7 Postman screenshots taken
- [ ] Each screenshot clearly shows: request + response
- [ ] HTTP status codes visible in each screenshot
- [ ] Screenshots are in chronological order (cart → order → payment → status)
- [ ] Include at least 2 error handling examples (empty cart, invalid token)
- [ ] Task description mentions all 4 requirements completed
- [ ] Attachments are properly named (1-AddToCart, 2-CreateOrder, etc.)
- [ ] Status marked as "Complete" or "Done"
- [ ] Links to documentation files provided (LOGGING.md, ERROR_HANDLING_AUDIT.md)

---

## 🚀 Quick Commands for Testing

If you need to reset and test again:

```bash
# Restart server (picks up env changes)
npm run dev

# View logs in real-time
tail -f logs/error.log

# Parse logs programmatically
cat logs/combined.log | jq '.[] | select(.level == "error")'
```

---

**Version:** 1.0  
**Date:** November 11, 2025  
**Status:** Ready for ClickUp ✅
