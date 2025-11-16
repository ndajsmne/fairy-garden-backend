const pool = require('../src/config/database');

(async () => {
  const email = process.argv[2] || 'lyraavg@gmail.com';
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      console.log(`No user found with email: ${email}`);
      process.exit(0);
    }
    const user = rows[0];
    // Hide sensitive pieces but show columns
    const safeUser = { ...user };
    if (safeUser.password) safeUser.password = '<hashed_password (hidden)>';
    console.log('User row:', safeUser);
    // For debugging, show whether password field exists in row
    console.log('Columns present:', Object.keys(user));
  } catch (err) {
    console.error('DB query error:', err.message);
  } finally {
    process.exit(0);
  }
})();