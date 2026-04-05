import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Inserta un registro de auditoría
 */
export async function insertLog({ adminId, gymId, entidad, entidadId, accion, detalles }) {
  let detallesJSON = null;

  try {
    detallesJSON = detalles ? JSON.stringify(detalles) : null;
  } catch (err) {
    throw new AppError("Error al serializar detalles de auditoría", 400);
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

export async function getLogsByAdminId(adminId) {
  const [rows] = await pool.query(
    `SELECT * FROM audit_logs WHERE admin_id = ? ORDER BY fecha DESC LIMIT 50`,
    [adminId]
  );
  return rows;
}
