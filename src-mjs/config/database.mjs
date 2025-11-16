import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fairygarden_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] ✅ Connected to MySQL successfully.');
    connection.release();
  } catch (err) {
    console.error('[DB] ❌ Database connection failed:', err.message);
  }
})();

export default pool;