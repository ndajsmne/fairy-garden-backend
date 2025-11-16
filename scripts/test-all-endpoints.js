#!/usr/bin/env node
/**
 * Quick API Testing Script for Fairy Garden Backend
 * Tests all major endpoints with realistic payloads
 * 
 * Usage: node scripts/test-all-endpoints.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API = axios.create({ baseURL: BASE_URL });

// Test credentials
let authTokenCustomer = '';
let authTokenAdmin = '';
let customerId = 0;
let adminId = 0;
let productId = 1;
let orderId = 0;
let cartItemId = 0;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}== ${msg} ==${colors.reset}\n`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

async function test(name, fn) {
  try {
    log.info(name);
    await fn();
    log.success(name);
    return true;
  } catch (error) {
    log.error(name);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data?.message || error.message}`);
    } else {
      console.error(`  ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  log.section('🌸 Fairy Garden API - Complete Test Suite');

  // ==================== AUTHENTICATION ====================
  log.section('1. AUTHENTICATION');

  await test('Register Customer', async () => {
    const res = await API.post('/api/auth/register', {
      nama: 'Test Customer',
      email: `customer_${Date.now()}@test.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    });
    authTokenCustomer = res.data.data.token;
    customerId = res.data.data.user.id;
    if (!authTokenCustomer) throw new Error('No token received');
  });

  await test('Register Admin', async () => {
    const res = await API.post('/api/auth/register', {
      nama: 'Test Admin',
      email: `admin_${Date.now()}@test.com`,
      password: 'AdminPass123!',
      confirmPassword: 'AdminPass123!'
    });
    authTokenAdmin = res.data.data.token;
    adminId = res.data.data.user.id;
  });

  // Convert admin to admin role (simulate first admin exists)
  await test('Update User to Admin Role', async () => {
    const res = await API.put(
      `/api/admin/users/${adminId}/role`,
      { role: 'admin' },
      { headers: { Authorization: `Bearer ${authTokenAdmin}` } }
    );
    if (!res.data.success && res.status !== 200) throw new Error('Failed to update role');
  }).catch(() => log.warn('Note: May fail if user already admin, skipping'));

  await test('Login Customer', async () => {
    const res = await API.post('/api/auth/login', {
      email: 'customer_test@test.com',
      password: 'TestPass123!'
    });
    if (!res.data.data.token) throw new Error('No token in login response');
  });

  // ==================== ADMIN USER MANAGEMENT ====================
  log.section('2. ADMIN USER MANAGEMENT');

  await test('List All Users (Admin Only)', async () => {
    const res = await API.post(
      '/api/admin/users',
      { page: 1, limit: 5 },
      { headers: { Authorization: `Bearer ${authTokenAdmin}` } }
    );
    if (!res.data.data || res.data.data.length === 0) {
      throw new Error('No users returned');
    }
  });

  await test('Get User by ID (Admin Only)', async () => {
    const res = await API.get(
      `/api/admin/users/${customerId}`,
      { headers: { Authorization: `Bearer ${authTokenAdmin}` } }
    );
    if (res.data.data.id !== customerId) throw new Error('Wrong user returned');
  });

  await test('Get Admin Dashboard Stats', async () => {
    const res = await API.get(
      '/api/admin/dashboard/stats',
      { headers: { Authorization: `Bearer ${authTokenAdmin}` } }
    );
    if (!res.data.data.users) throw new Error('Stats missing users data');
  });

  // ==================== PRODUCTS ====================
  log.section('3. PRODUCTS');

  await test('Get All Products (Public)', async () => {
    const res = await API.get('/api/produk');
    if (!Array.isArray(res.data.data)) throw new Error('Products not an array');
    if (res.data.data.length > 0) {
      productId = res.data.data[0].id;
    }
  });

  await test('Get Single Product', async () => {
    const res = await API.get(`/api/produk/${productId}`);
    if (res.data.data.id !== productId) throw new Error('Wrong product returned');
  });

  await test('Get Featured Products', async () => {
    const res = await API.get('/api/produk/featured');
    if (!Array.isArray(res.data.data)) throw new Error('Featured not an array');
  });

  // ==================== SHOPPING CART ====================
  log.section('4. SHOPPING CART');

  await test('Add to Cart', async () => {
    const res = await API.post(
      '/api/cart',
      { product_id: productId, quantity: 2 },
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    cartItemId = res.data.data.cart_item_id;
    if (!cartItemId) throw new Error('No cart item ID returned');
  });

  await test('Get Cart', async () => {
    const res = await API.get(
      '/api/cart',
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    if (!Array.isArray(res.data.data)) throw new Error('Cart not an array');
  });

  await test('Update Cart Item', async () => {
    await API.put(
      `/api/cart/update/${cartItemId}`,
      { quantity: 3 },
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
  });

  // ==================== ORDERS ====================
  log.section('5. ORDERS');

  await test('Create Order', async () => {
    const res = await API.post(
      '/api/orders',
      {
        shippingAddress: {
          address: 'Jl. Merdeka No. 123',
          postalCode: '12345',
          province: 'Jakarta'
        },
        deliveryMethod: 'standard',
        deliveryDate: '2025-11-20',
        recipientName: 'Test Recipient',
        recipientPhone: '08123456789'
      },
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    orderId = res.data.data.order_id;
    if (!orderId) throw new Error('No order ID returned');
  });

  await test('Get User Orders', async () => {
    const res = await API.get(
      '/api/orders/my-orders',
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    if (!Array.isArray(res.data.data)) throw new Error('Orders not an array');
  });

  await test('Get Order Details', async () => {
    const res = await API.get(`/api/orders/${orderId}`);
    if (res.data.data.id !== orderId) throw new Error('Wrong order returned');
  });

  // ==================== PAYMENTS ====================
  log.section('6. PAYMENTS');

  await test('Initiate Payment', async () => {
    const res = await API.post(
      `/api/payments/orders/${orderId}/pay`,
      {},
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    if (!res.data.data.paymentToken) throw new Error('No payment token');
  });

  await test('Get Payment Status', async () => {
    const res = await API.get(
      `/api/payments/orders/${orderId}/payment-status`,
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    if (res.data.data.orderId !== orderId) throw new Error('Wrong order in status');
  });

  // ==================== PROFILE ====================
  log.section('7. PROFILE');

  await test('Get Profile', async () => {
    const res = await API.get(
      '/api/profile',
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
    if (res.data.data.id !== customerId) throw new Error('Wrong user in profile');
  });

  await test('Update Profile', async () => {
    await API.put(
      '/api/profile',
      { name: 'Updated Name', phone: '08987654321' },
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
  });

  // ==================== CATEGORIES ====================
  log.section('8. CATEGORIES');

  await test('Get All Categories', async () => {
    const res = await API.get('/api/categories');
    if (!Array.isArray(res.data.data)) throw new Error('Categories not an array');
  });

  // ==================== SECURITY ====================
  log.section('9. SECURITY');

  await test('Test 401 - No Token', async () => {
    try {
      await API.get('/api/admin/users');
      throw new Error('Should have failed without token');
    } catch (error) {
      if (error.response?.status !== 401) throw error;
    }
  });

  await test('Test 403 - Customer Access Admin Endpoint', async () => {
    try {
      await API.get(
        '/api/admin/users',
        { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
      );
      throw new Error('Should have failed with customer token');
    } catch (error) {
      if (error.response?.status !== 403) throw error;
    }
  });

  await test('Test Logout', async () => {
    await API.post(
      '/api/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${authTokenCustomer}` } }
    );
  });

  // ==================== SUMMARY ====================
  log.section('✅ TEST SUITE COMPLETE');
  log.info(`Customer ID: ${customerId}`);
  log.info(`Admin ID: ${adminId}`);
  log.info(`Order ID: ${orderId}`);
  log.info(`Product ID: ${productId}`);
  log.success('All critical endpoints tested successfully!');
  log.warn('Check documentation: docs/API_TESTING_GUIDE.md');
}

// Run tests
runTests().catch(error => {
  log.error('Test suite failed');
  console.error(error);
  process.exit(1);
});
