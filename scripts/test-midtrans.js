require('dotenv').config();
const midtransClient = require('midtrans-client');

async function test() {
  try {
    const snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const parameter = {
      transaction_details: {
        order_id: `TEST-` + Date.now(),
        gross_amount: 1000
      },
      customer_details: {
        first_name: 'Test User',
        email: 'test@example.com'
      }
    };

    console.log('Testing Midtrans snap.createTransaction with serverKey:', !!process.env.MIDTRANS_SERVER_KEY);

    const transaction = await snap.createTransaction(parameter);
    console.log('Midtrans response:', transaction);
  } catch (err) {
    console.error('Midtrans test error:');
    if (err && err.httpStatusCode) {
      console.error('HTTP status:', err.httpStatusCode);
    }
    if (err && err.body) {
      console.error('Body:', err.body);
    }
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
}

test();
