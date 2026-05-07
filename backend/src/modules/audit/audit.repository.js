import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Persists a new audit log entry into the database.
 * Handles serialization of optional metadata and enforces referential integrity.
 * 
 * @param {Object} data - Audit log components (actor, target, action, metadata).
 * @returns {Promise<Object>} The newly created audit record.
 * @throws {AppError} If metadata serialization fails.
 */
export async function insertLog({ adminId, gymId, entidad, entidadId, accion, detalles }) {
  let detallesJSON = null;

  try {
    detallesJSON = detalles ? JSON.stringify(detalles) : null;
  } catch (err) {
    throw new AppError("Failed to serialize audit metadata details", 400);
  }

  const [result] = await pool.query(
    `INSERT INTO audit_logs (admin_id, gym_id, entidad, entidad_id, accion, detalles, fecha)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [adminId, gymId, entidad, entidadId, accion, detallesJSON]
  );

  const [rows] = await pool.query(
    `SELECT * FROM audit_logs WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

/**
 * Retrieves the most recent operational logs for a specific administrator.
 * Limited to the 50 most recent entries to maintain system performance.
 * 
 * @param {number} adminId - The administrator's identifier.
 * @returns {Promise<Array>} Chronological list of logs.
 */
export async function getLogsByAdminId(adminId) {
  const [rows] = await pool.query(
    `SELECT * FROM audit_logs WHERE admin_id = ? ORDER BY fecha DESC LIMIT 50`,
    [adminId]
  );
  return rows;
}
