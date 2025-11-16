const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

(async () => {
  const email = process.argv[2] || 'lyraavg@gmail.com';
  const plaintext = process.argv[3] || 'nadia895';
  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      console.log(`No user found with email: ${email}`);
      process.exit(0);
    }
    const hash = rows[0].password;
    const match = await bcrypt.compare(plaintext, hash);
    console.log(`Password match for ${email}:`, match);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();