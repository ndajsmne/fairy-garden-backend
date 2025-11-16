const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'fairygarden_db';

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] ✅ Connected to MySQL successfully (${DB_HOST}:${DB_PORT}/${DB_NAME}).`);
    connection.release();
  } catch (err) {
    console.error('[DB] ❌ Database connection failed:');
    console.error('  Host:', DB_HOST);
    console.error('  Port:', DB_PORT);
    console.error('  Database:', DB_NAME);
    console.error('  Error:', err && err.message ? err.message : err);
    console.error('  Suggestion: Ensure MySQL server is running and reachable. On Windows check Services (services.msc) or start the MySQL service (e.g., `sc start MySQL80`), or verify connection settings in .env.');
  }
})();

module.exports = pool;
