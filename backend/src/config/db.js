import mysql from 'mysql2/promise';
import { config } from './env.js';

/**
 * Database Connection Pool
 * 
 * Configures and initializes a high-performance MySQL connection pool using the promise-based mysql2 SDK.
 * Features:
 * - Persistent connection pooling to minimize handshake overhead.
 * - Managed concurrency with a 10-connection limit.
 * - Automatic queuing for high-load transaction environments.
 */
export const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Connection Health Check
 * 
 * Executes a lightweight validation query to ensure the database layer is operational.
 * Logs the connectivity status to the system console during server initialization.
 */
export async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Database Connectivity Status: OK (MySQL Result:', rows[0].result, ')');
  } catch (err) {
    console.error('Critical Database Connectivity Error:', err);
  }
}
