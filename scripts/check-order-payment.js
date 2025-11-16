const db = require('../src/config/database');

(async () => {
  try {
    console.log('\n=== ORDER & PAYMENT STATUS ===\n');
    
    // Check orders 1-5
    const [orders] = await db.query(`
      SELECT id, order_number, status, payment_status, total_amount, created_at 
      FROM orders 
      WHERE id >= 1 
      ORDER BY id DESC 
      LIMIT 10
    `);
    
    console.log('ORDERS:');
    console.table(orders);
    
    // Check payments
    const [payments] = await db.query(`
      SELECT * FROM payments 
      ORDER BY order_id DESC 
      LIMIT 10
    `);
    
    console.log('\nPAYMENTS:');
    console.table(payments);
    
    // Check cart items for each user
    const [cartItems] = await db.query(`
      SELECT user_id, COUNT(*) as item_count 
      FROM cart_items 
      GROUP BY user_id
    `);
    
    console.log('\nCART ITEMS BY USER:');
    console.table(cartItems);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
