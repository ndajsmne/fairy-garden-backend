# Fairy Garden Backend API

Backend service untuk aplikasi e-commerce Fairy Garden, sebuah toko bunga online.

## Struktur Proyek

```
fairy-garden-backend/
├── src/
│   ├── config/               # Konfigurasi aplikasi
│   │   ├── database.js      # Koneksi database MySQL
│   │   ├── logger.js        # Konfigurasi logging
│   │   ├── midtrans.js      # Konfigurasi payment gateway
│   │   ├── schema.sql       # Schema database
│   │   └── swagger.js       # Dokumentasi API
│   │
│   ├── controllers/         # Logic bisnis
│   │   ├── authController.js     # Autentikasi (login/register)
│   │   ├── cartController.js     # Manajemen keranjang
│   │   ├── categoryController.js # Manajemen kategori produk
│   │   ├── orderController.js    # Manajemen pesanan
│   │   ├── paymentController.js  # Proses pembayaran
│   │   ├── productController.js  # Manajemen produk
│   │   └── profileController.js  # Manajemen profil user
│   │
│   ├── middleware/         # Middleware Express
│   │   ├── auth.js        # Autentikasi JWT & role-based access
│   │   ├── errorHandler.js # Global error handling
│   │   ├── security.js    # Security middlewares
│   │   └── validation.js  # Request validation
│   │
│   ├── models/            # Model database
│   │   ├── cart.js       # Model keranjang belanja
│   │   ├── category.js   # Model kategori produk
│   │   ├── order.js      # Model pesanan
│   │   ├── payment.js    # Model pembayaran
│   │   ├── product.js    # Model produk
│   │   └── user.js       # Model pengguna
│   │
│   ├── routes/           # Route API
│   │   ├── authRoutes.js      # Endpoint autentikasi
│   │   ├── cartRoutes.js      # Endpoint keranjang
│   │   ├── categoryRoutes.js  # Endpoint kategori
│   │   ├── orderRoutes.js     # Endpoint pesanan
│   │   ├── paymentRoutes.js   # Endpoint pembayaran
│   │   ├── productRoutes.js   # Endpoint produk
│   │   └── profileRoutes.js   # Endpoint profil
│   │
│   └── index.js          # Entry point aplikasi
│
├── scripts/              # Script utilitas
│   ├── setup-db.js      # Setup database
│   └── verify-db.js     # Verifikasi koneksi DB
│
├── .env                 # Environment variables
├── .env.example        # Contoh environment variables
└── package.json        # Dependencies dan scripts
```

## Fitur Utama

### 1. Autentikasi & Autorisasi
- JWT-based authentication
- Role-based access control (Admin & Customer)
- Register dengan validasi
- Login dengan token
- Profile management

### 2. Manajemen Produk
- CRUD produk (Admin)
- Pencarian dan filter produk
- Kategori produk
- Produk unggulan
- Produk terkait

### 3. Keranjang Belanja
- Tambah ke keranjang
- Update jumlah
- Hapus dari keranjang
- Hitung total
- Validasi stok

### 4. Manajemen Pesanan
- Checkout dari keranjang
- Riwayat pesanan
- Status pesanan
- Detail pesanan
- Pembatalan pesanan

### 5. Pembayaran
- Integrasi Midtrans
- Generate payment token
- Update status pembayaran
- Notifikasi pembayaran

### 6. Fitur Keamanan
- Rate limiting
- XSS protection
- Request validation
- Error handling
- SQL injection protection

## API Endpoints

### Autentikasi
- POST `/api/auth/register` - Registrasi user baru
- POST `/api/auth/login` - Login user

### Produk
- GET `/api/products` - List semua produk
- GET `/api/products/:id` - Detail produk
- POST `/api/products` - Tambah produk (Admin)
- PUT `/api/products/:id` - Update produk (Admin)
- DELETE `/api/products/:id` - Hapus produk (Admin)

### Keranjang
- GET `/api/cart` - Lihat keranjang
- POST `/api/cart/add` - Tambah ke keranjang
- PUT `/api/cart/update/:id` - Update item keranjang
- DELETE `/api/cart/remove/:id` - Hapus dari keranjang
- DELETE `/api/cart/clear` - Kosongkan keranjang

### Pesanan
- POST `/api/orders` - Buat pesanan baru
- GET `/api/orders/my-orders` - Riwayat pesanan (Customer)
- GET `/api/orders/:id` - Detail pesanan
- PUT `/api/orders/:id/status` - Update status (Admin)
- POST `/api/orders/:id/cancel` - Batalkan pesanan

### Pembayaran
- POST `/api/orders/:id/pay` - Mulai pembayaran
- GET `/api/orders/:id/payment-status` - Cek status pembayaran
- POST `/api/payment-notification` - Webhook notifikasi Midtrans

### Profil
- GET `/api/profile` - Lihat profil
- PUT `/api/profile` - Update profil
- PUT `/api/profile/password` - Ganti password

## Database Schema

### Users Table
- id (PK)
- first_name
- last_name
- email (unique)
- password
- phone
- role (enum: admin, customer)
- created_at
- updated_at

### Products Table
- id (PK)
- name
- description
- price
- stock
- image_url
- category_id (FK)
- featured
- created_at
- updated_at

### Orders Table
- id (PK)
- user_id (FK)
- status
- total_amount
- shipping_address
- created_at
- updated_at

### Payments Table
- id (PK)
- order_id (FK)
- amount
- status
- payment_method
- transaction_id
- payment_url
- created_at
- updated_at

## Setup Development

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Setup environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env sesuai konfigurasi
\`\`\`

3. Setup database:
\`\`\`bash
node scripts/setup-db.js
\`\`\`

4. Jalankan server:
\`\`\`bash
npm run dev
\`\`\`

## Testing API

API documentation tersedia di:
- Swagger UI: http://localhost:3000/api-docs
- Postman Collection: [Fairy Garden API.postman_collection.json]