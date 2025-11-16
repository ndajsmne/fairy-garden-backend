# 🌸 Fairy Garden API - Complete Testing Guide

**Base URL:** `http://localhost:3000`  
**Swagger Docs:** `http://localhost:3000/api-docs`

---

## 📋 Quick Setup for Testing

### 1. Environment Variables
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fairy_garden_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
MIDTRANS_SERVER_KEY=your_midtrans_key
MIDTRANS_CLIENT_KEY=your_midtrans_key
MIDTRANS_MERCHANT_ID=your_merchant_id
NODE_ENV=development
```

### 2. Start Server
```bash
npm install
npm run dev
```

### 3. Import Postman Collection
- File: `postman/Fairy-Garden-API.postman_collection.json`
- Set variables: `BASE_URL=http://localhost:3000`, `JWT_TOKEN=(after login)`

---

## 🔑 Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

**Validation Rules:**
- `nama`: 3-100 characters, letters/spaces/hyphens/apostrophes only
- `email`: Valid email format, unique in database
- `password`: Min 8 chars, uppercase + lowercase + number + special char (@$!%*?&)
- `confirmPassword`: Must match password

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  ]
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### 3. Logout User
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 4. Admin - Revoke User Tokens
**POST** `/api/auth/admin/revoke/:userId`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `userId` (path): User ID to revoke tokens for (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All tokens for user 2 have been revoked"
}
```

---

## 👥 Admin User Management Endpoints

### 1. List All Users (Admin Only)
**POST** `/api/admin/users`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Request Body (optional filters):**
```json
{
  "page": 1,
  "limit": 10,
  "role": "customer",
  "search": "john"
}
```

**Validation Rules:**
- `page`: Optional, positive integer (default: 1)
- `limit`: Optional, 1-100 (default: 10)
- `role`: Optional, enum: "admin" or "customer"
- `search`: Optional, 1-100 characters

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "created_at": "2025-11-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### 2. Get User by ID (Admin Only)
**GET** `/api/admin/users/:userId`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `userId` (path): User ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "role": "customer",
    "created_at": "2025-11-15T10:30:00Z"
  }
}
```

---

### 3. Update User Role (Admin Only)
**PUT** `/api/admin/users/:userId/role`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `userId` (path): User ID (positive integer)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Validation Rules:**
- `role`: Required, enum: "admin" or "customer"

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User role updated to admin successfully",
  "data": {
    "userId": 1,
    "newRole": "admin"
  }
}
```

---

### 4. Delete User (Admin Only)
**DELETE** `/api/admin/users/:userId`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `userId` (path): User ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "userId": 2,
    "email": "user@example.com"
  }
}
```

---

### 5. Create New Admin (Admin Only)
**POST** `/api/admin/create-admin`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Request Body:**
```json
{
  "nama": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass@123",
  "confirmPassword": "AdminPass@123"
}
```

**Validation Rules:**
- `nama`: 3-100 characters, letters/spaces/hyphens/apostrophes only
- `email`: Valid email format, unique in database
- `password`: Min 8 chars, uppercase + lowercase + number + special char (@$!%*?&)
- `confirmPassword`: Must match password

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 5,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

### 6. Admin Dashboard Statistics (Admin Only)
**GET** `/api/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": {
      "total": 15,
      "admins": 2,
      "customers": 13
    },
    "products": {
      "total": 45
    },
    "orders": {
      "total": 28
    },
    "recentOrders": [
      {
        "id": 1,
        "user_id": 3,
        "total_amount": 150000,
        "status": "completed",
        "created_at": "2025-11-15T10:30:00Z"
      }
    ],
    "paymentStats": [
      {
        "status": "success",
        "count": 20
      },
      {
        "status": "pending",
        "count": 5
      }
    ]
  }
}
```

---

## 🛍️ Product Endpoints

### 1. Get All Products
**GET** `/api/produk?search=bunga&category=1&sortBy=name&sortOrder=asc&minPrice=10000&maxPrice=100000&page=1&limit=12`

**Query Parameters (all optional):**
- `search`: Search product name
- `category`: Filter by category ID
- `sortBy`: Sort by field (name, price, created_at)
- `sortOrder`: asc or desc
- `minPrice`, `maxPrice`: Price range filter
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Bunga Mawar Merah",
      "description": "Bunga mawar merah segar",
      "price": 50000,
      "stock": 100,
      "category_id": 1,
      "image_url": "http://...",
      "created_at": "2025-11-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Featured Products
**GET** `/api/produk/featured`

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Bunga Mawar Merah",
      "price": 50000,
      "image_url": "http://..."
    }
  ]
}
```

---

### 3. Get Single Product
**GET** `/api/produk/:id`

**Parameters:**
- `id` (path): Product ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Bunga Mawar Merah",
    "description": "Deskripsi detail produk",
    "price": 50000,
    "stock": 100,
    "category_id": 1,
    "image_url": "http://...",
    "related_products": [
      { "id": 2, "name": "Bunga Mawar Pink", "price": 45000 }
    ]
  }
}
```

---

### 4. Create Product (Admin Only)
**POST** `/api/produk`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Request Body:**
```json
{
  "name": "Bunga Tulip Kuning",
  "description": "Bunga tulip kuning premium",
  "price": 35000,
  "stock": 50,
  "category_id": 2,
  "image_url": "http://example.com/image.jpg"
}
```

**Validation Rules:**
- `name`: Required, string
- `description`: Required, string
- `price`: Required, positive number (in Rupiah)
- `stock`: Required, positive integer
- `category_id`: Required, positive integer
- `image_url`: Optional, valid URL format

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": 46,
    "name": "Bunga Tulip Kuning",
    "price": 35000,
    "stock": 50
  }
}
```

---

### 5. Update Product (Admin Only)
**PUT** `/api/produk/:id`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `id` (path): Product ID (positive integer)

**Request Body:**
```json
{
  "name": "Bunga Tulip Kuning Premium",
  "price": 40000,
  "stock": 45
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Product updated successfully"
}
```

---

### 6. Delete Product (Admin Only)
**DELETE** `/api/produk/:id`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `id` (path): Product ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

---

## 🛒 Cart Endpoints

### 1. Get Cart (Customer Only)
**GET** `/api/cart`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Bunga Mawar Merah",
        "price": 50000
      }
    }
  ]
}
```

---

### 2. Add to Cart (Customer Only)
**POST** `/api/cart`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Validation Rules:**
- `product_id`: Required, positive integer
- `quantity`: Required, integer between 1 and 1000

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Product added to cart",
  "data": {
    "cart_item_id": 5,
    "product_id": 1,
    "quantity": 2
  }
}
```

---

### 3. Update Cart Item (Customer Only)
**PUT** `/api/cart/update/:cartItemId`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Parameters:**
- `cartItemId` (path): Cart item ID (positive integer)

**Request Body:**
```json
{
  "quantity": 3
}
```

**Validation Rules:**
- `quantity`: Required, integer between 1 and 1000

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Cart item updated"
}
```

---

### 4. Remove from Cart (Customer Only)
**DELETE** `/api/cart/remove/:cartItemId`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Parameters:**
- `cartItemId` (path): Cart item ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Item removed from cart"
}
```

---

### 5. Clear Cart (Customer Only)
**DELETE** `/api/cart/clear`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Cart cleared successfully"
}
```

---

## 📦 Order Endpoints

### 1. Create Order / Checkout (Customer Only)
**POST** `/api/orders` or `/api/orders/checkout`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Request Body:**
```json
{
  "shippingAddress": {
    "address": "Jl. Merdeka No. 123",
    "postalCode": "12345",
    "province": "Jakarta"
  },
  "deliveryMethod": "standard",
  "deliveryDate": "2025-11-20",
  "deliveryTime": "09:00-12:00",
  "recipientName": "John Doe",
  "recipientPhone": "08123456789",
  "senderName": "Jane Smith",
  "senderPhone": "08987654321",
  "cardMessage": "Happy Birthday!"
}
```

**Validation Rules:**
- `shippingAddress`: Required, object with:
  - `address`: Required, non-empty string
  - `postalCode`: Required, non-empty string
  - `province`: Required, non-empty string
- `deliveryMethod`: Optional, string
- `deliveryDate`: Optional, valid ISO 8601 date format
- `deliveryTime`: Optional, string
- `recipientName`: Optional, string
- `recipientPhone`: Optional, string
- `senderName`: Optional, string
- `senderPhone`: Optional, string
- `cardMessage`: Optional, string
- `cardFrom`: Optional, string
- `cardTo`: Optional, string

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order_id": 5,
    "user_id": 1,
    "total_amount": 150000,
    "status": "pending",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 75000
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "Validation failed",
  "details": [
    {
      "field": "shippingAddress",
      "message": "shippingAddress must be an object"
    }
  ]
}
```

---

### 2. Get User Orders (Customer Only)
**GET** `/api/orders/my-orders`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "total_amount": 150000,
      "status": "completed",
      "created_at": "2025-11-15T10:30:00Z",
      "items": [...]
    }
  ]
}
```

---

### 3. Get Order Details
**GET** `/api/orders/:orderId`

**Parameters:**
- `orderId` (path): Order ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 150000,
    "status": "pending",
    "shipping_address": "Jl. Merdeka No. 123",
    "items": [...],
    "payment": {...}
  }
}
```

---

### 4. Cancel Order (Customer Only)
**POST** `/api/orders/:orderId/cancel`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Parameters:**
- `orderId` (path): Order ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Order cancelled successfully"
}
```

---

### 5. Get All Orders (Admin Only)
**GET** `/api/orders/admin`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "total_amount": 150000,
      "status": "pending"
    }
  ]
}
```

---

### 6. Update Order Status (Admin Only)
**PUT** `/api/orders/admin/:orderId/status`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `orderId` (path): Order ID (positive integer)

**Request Body:**
```json
{
  "status": "completed"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Order status updated"
}
```

---

## 💳 Payment Endpoints

### 1. Initiate Payment
**POST** `/api/payments/orders/:orderId/pay`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Parameters:**
- `orderId` (path): Order ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "orderId": 1,
    "paymentToken": "23e50c4c-dd47-4f36-a8f1-e3b6e0d5d5d5",
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/23e50c4c...",
    "status": "pending"
  }
}
```

---

### 2. Get Payment Status
**GET** `/api/payments/orders/:orderId/payment-status`

**Headers:**
```
Authorization: Bearer {CUSTOMER_JWT_TOKEN}
```

**Parameters:**
- `orderId` (path): Order ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "orderId": 1,
    "paymentStatus": "settlement",
    "amount": 150000,
    "paymentMethod": "card",
    "transactionDate": "2025-11-15T10:30:00Z"
  }
}
```

---

### 3. Payment Notification (Webhook)
**POST** `/api/payments/payment-notification`

*(Called by Midtrans server - no auth needed)*

**Request Body:**
```json
{
  "transaction_status": "settlement",
  "order_id": "1",
  "transaction_id": "23e50c4c-dd47-4f36-a8f1-e3b6e0d5d5d5"
}
```

---

### 4. Simulate Payment Notification (Testing)
**POST** `/api/payments/simulate-notification`

**Request Body:**
```json
{
  "order_id": 1,
  "transaction_status": "settlement",
  "payment_type": "card"
}
```

**Validation Rules:**
- `order_id`: Required, positive integer
- `transaction_status`: Required, enum: "pending", "capture", "settle", "cancel", "deny", "expire"
- `payment_type`: Optional, string max 50 characters

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payment notification processed"
}
```

---

## 👤 Profile Endpoints

### 1. Get Profile (Authenticated User)
**GET** `/api/profile`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "role": "customer"
  }
}
```

---

### 2. Update Profile (Authenticated User)
**PUT** `/api/profile`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "08987654321"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully"
}
```

---

### 3. Change Password (Authenticated User)
**PUT** `/api/profile/password`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

**Validation Rules:**
- `currentPassword`: Required, must be correct
- `newPassword`: Min 8 chars, uppercase + lowercase + number + special char
- `confirmPassword`: Must match newPassword

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

---

## 🏷️ Category Endpoints

### 1. Get All Categories
**GET** `/api/categories`

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Bunga Segar",
      "description": "Koleksi bunga segar paling bagus"
    }
  ]
}
```

---

### 2. Get Category by ID
**GET** `/api/categories/:id`

**Parameters:**
- `id` (path): Category ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Bunga Segar",
    "description": "Koleksi bunga segar paling bagus"
  }
}
```

---

### 3. Create Category (Admin Only)
**POST** `/api/categories`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Request Body:**
```json
{
  "name": "Bunga Artificial",
  "description": "Koleksi bunga artificial berkualitas tinggi"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "name": "Bunga Artificial"
  }
}
```

---

### 4. Update Category (Admin Only)
**PUT** `/api/categories/:id`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `id` (path): Category ID (positive integer)

**Request Body:**
```json
{
  "name": "Bunga Premium",
  "description": "Koleksi bunga premium pilihan"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Category updated successfully"
}
```

---

### 5. Delete Category (Admin Only)
**DELETE** `/api/categories/:id`

**Headers:**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Parameters:**
- `id` (path): Category ID (positive integer)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Category deleted successfully"
}
```

---

## 🧪 Testing Checklist

### Phase 1: Authentication
- [ ] Register new user with password `Password@123`
- [ ] Login user
- [ ] Verify JWT token in response
- [ ] Logout user
- [ ] Test invalid credentials
- [ ] Test password validation rules (must include uppercase, lowercase, digit, special char)
- [ ] Test duplicate email registration

### Phase 2: Admin User Management
- [ ] List all users with pagination (page=1, limit=10)
- [ ] Get user by ID
- [ ] Update user role from "customer" to "admin"
- [ ] Delete user account
- [ ] Get dashboard statistics
- [ ] Prevent self-deletion
- [ ] Prevent self-demotion

### Phase 3: Products
- [ ] Get all products (no auth needed)
- [ ] Get featured products
- [ ] Create product (admin only)
- [ ] Update product (admin only)
- [ ] Delete product (admin only)
- [ ] Test 403 error when customer tries to create

### Phase 4: Shopping (Customer Flow)
- [ ] Add product to cart (product_id: integer, quantity: 1-1000)
- [ ] View cart
- [ ] Update cart item quantity
- [ ] Remove from cart
- [ ] Create order from cart
- [ ] Verify order contains cart items
- [ ] Clear cart

### Phase 5: Orders
- [ ] Get user orders
- [ ] Get order details
- [ ] Cancel order
- [ ] Get all orders (admin only)
- [ ] Update order status (admin only)

### Phase 6: Payments
- [ ] Initiate payment (create Midtrans token)
- [ ] Get payment status
- [ ] Simulate payment notification with valid status (settlement, capture, etc.)

### Phase 7: Security Testing
- [ ] Test rate limiting (100 req/min)
- [ ] Test XSS sanitization
- [ ] Test token expiration
- [ ] Test invalid token
- [ ] Test revoked token
- [ ] Test 401/403 errors

---

## 📌 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing JWT token | Add Authorization header with valid token |
| 403 Forbidden | Not admin/customer role | Use correct role account |
| 400 Bad Request | Validation failed | Check payload format & validation rules |
| 409 Conflict | Duplicate email | Use different email address |
| 404 Not Found | Resource not found | Check ID parameter value |
| 429 Too Many Requests | Rate limit exceeded | Wait or reduce request frequency |
| Password Invalid | Missing uppercase/lowercase/number/special char | Use format: Password@123 |
| Invalid Enum | Wrong value for transaction_status | Use: pending, capture, settle, cancel, deny, expire |
| Quantity Out of Range | Not between 1-1000 | Use valid quantity between 1 and 1000 |

---

## 🚀 Quick Test with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama":"John Doe",
    "email":"john@example.com",
    "password":"Password@123",
    "confirmPassword":"Password@123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"Password@123"
  }'
```

### Get Products
```bash
curl -X GET http://localhost:3000/api/produk
```

### Add to Cart (requires auth)
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id":1,
    "quantity":2
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "address": "Jl. Merdeka No. 123",
      "postalCode": "12345",
      "province": "Jakarta"
    }
  }'
```

### Simulate Payment
```bash
curl -X POST http://localhost:3000/api/payments/simulate-notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id":1,
    "transaction_status":"settlement",
    "payment_type":"card"
  }'
```

---

**Last Updated:** November 15, 2025  
**API Version:** 1.0.0  
**Status:** ✅ All request bodies validated and corrected
