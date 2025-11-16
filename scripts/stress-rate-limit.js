const autocannon = require('autocannon');

const url = process.argv[2] || 'http://localhost:3000/api/orders';

console.log(`Running stress test against ${url} (100 connections, 10s)`);

autocannon({
  url,
  connections: 100,
  duration: 10,
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify({ shippingAddress: { address: 'Test', city: 'Jakarta', province: 'DKI', postalCode: '12345' } })
}, console.log);
