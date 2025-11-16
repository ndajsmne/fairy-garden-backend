const axios = require('axios');

(async () => {
  try {
    const target = process.env.TARGET || 'http://localhost:3000/api/orders';
    const token = process.env.TOKEN || '';

    const payload = {
      shippingAddress: {
        address: "<script>alert('xss')</script>",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "12345"
      },
      deliveryMethod: "delivery",
      deliveryDate: "2025-11-15",
      deliveryTime: "14:00",
      recipientName: "Jane <img src=x onerror=alert(1)>",
      recipientPhone: "081234567890"
    };

    const res = await axios.post(target, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    console.log('Status:', res.status);
    console.log('Response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Response:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
})();
