const db = require('../src/config/database');

(async () => {
  try {
    console.log('\n=== CLEANING UP DUPLICATE PAYMENT RECORDS ===\n');
    
    // Get the first (oldest) completed payment for each order
    const [duplicatePayments] = await db.query(`
      SELECT order_id, MIN(id) as keep_id
      FROM payments
      WHERE status = 'completed'
      GROUP BY order_id
      HAVING COUNT(*) > 1
    `);
    
    if (duplicatePayments.length === 0) {
      console.log('✅ No duplicate payments found.');
      process.exit(0);
    }
    
    console.log(`Found ${duplicatePayments.length} order(s) with duplicate completed payments.\n`);
    
    for (const dup of duplicatePayments) {
      const { order_id, keep_id } = dup;
      
      // Delete all payment records for this order except the first one
      const [result] = await db.query(`
        DELETE FROM payments 
        WHERE order_id = ? AND id != ?
      `, [order_id, keep_id]);
      
      console.log(`✅ Order ${order_id}: Kept payment ID ${keep_id}, deleted ${result.affectedRows} duplicate(s).`);
    }
    
    console.log('\n=== FINAL PAYMENT STATUS ===\n');
    const [finalPayments] = await db.query(`
      SELECT id, order_id, amount, status, transaction_id, created_at 
      FROM payments 
      ORDER BY order_id DESC
    `);
    console.table(finalPayments);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
