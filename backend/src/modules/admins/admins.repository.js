import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Retrieves all staff members (excluding the owner) belonging to the 
 * same gyms as the specified owner.
 * 
 * @param {number} ownerId - The ID of the gym owner.
 * @returns {Promise<Array>} A list of staff members with basic profile info.
 */
export async function findAdminsByOwner(ownerId) {
  // Integrity Check: Ensure the requesting administrator is a verified owner (DUENO)
  const [ownerRows] = await pool.query(
    `SELECT a.*
     FROM admins a
     JOIN admins_gyms ag ON ag.admin_id = a.id
     WHERE a.id = ? AND ag.rol = 'DUENO' AND a.activo = 1
     LIMIT 1`,
    [ownerId]
  );

  if (!ownerRows[0]) {
    throw new AppError('Administrator record not found or lacks OWNER privileges', 404);
  }

  // Cross-reference: Find all other administrators linked to the owner's gym branches
  const [rows] = await pool.query(
    `SELECT DISTINCT a.id, a.nombre, a.apellido, a.ultimo_login
     FROM admins a
     JOIN admins_gyms ag ON ag.admin_id = a.id
     WHERE ag.gym_id IN (
       SELECT gym_id FROM admins_gyms WHERE admin_id = ? AND rol = 'DUENO'
     )
     AND a.id != ?
     ORDER BY a.nombre ASC`,
    [ownerId, ownerId]
  );

  return rows;
}

/** Retrieves basic identity data for a single staff member by ID. */
export async function findAdminById(adminId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.nombre, a.apellido, a.activo
     FROM admins a
     WHERE a.id = ?`,
    [adminId]
  );

  return rows[0] || null;
}

/**
 * Persists updates across multiple administrative tables (admins, profile, gym mapping).
 * Handles partial updates via COALESCE.
 */
export async function updateAdmin(adminId, data) {
  const { nombre, apellido, edad, sexo, direccion, foto, gymId } = data;

  // Transaction Layer 1: Base identity update
  if (nombre || apellido) {
    await pool.query(
      `UPDATE admins SET nombre = COALESCE(?, nombre), apellido = COALESCE(?, apellido)
       WHERE id = ?`,
      [nombre, apellido, adminId]
    );
  }

  // Transaction Layer 2: Extended profile update (Upsert logic)
  if (edad !== undefined || sexo || direccion !== undefined || foto) {
    const [existingProfile] = await pool.query(
      `SELECT * FROM admins_perfil WHERE admin_id = ?`,
      [adminId]
    );

    if (existingProfile.length > 0) {
      await pool.query(
        `UPDATE admins_perfil SET edad = COALESCE(?, edad), sexo = COALESCE(?, sexo),
                 direccion = COALESCE(?, direccion), foto = COALESCE(?, foto)
         WHERE admin_id = ?`,
        [edad, sexo, direccion, foto, adminId]
      );
    } else {
      await pool.query(
        `INSERT INTO admins_perfil (admin_id, edad, sexo, direccion, foto)
         VALUES (?, ?, ?, ?, ?)`,
        [adminId, edad, sexo, direccion, foto]
      );
    }
  }

  // Transaction Layer 3: Branch assignment management
  if (gymId) {
    const [gymAssignments] = await pool.query(
      `SELECT * FROM admins_gyms WHERE admin_id = ?`,
      [adminId]
    );

    if (gymAssignments.length === 0) {
      // Create new link if none exists
      await pool.query(
        `INSERT INTO admins_gyms (admin_id, gym_id, rol) VALUES (?, ?, 'EMPLEADO')`,
        [adminId, gymId]
      );
    } else {
      // Re-map the primary branch association
      await pool.query(
        `UPDATE admins_gyms SET gym_id = ? WHERE admin_id = ? LIMIT 1`,
        [gymId, adminId]
      );
    }
  }

  return findAdminById(adminId);
}

/**
 * Executes a full cascade deletion for a staff member.
 * Security: Prevents the deletion of any account with 'DUENO' privileges.
 */
export async function deleteAdmin(adminId) {
  const [admin] = await pool.query(
    `SELECT * FROM admins WHERE id = ?`,
    [adminId]
  );

  if (!admin.length) {
    throw new AppError('Staff record not found', 404);
  }

  // Policy: Owners cannot be deleted through the standard staff management interface
  const [duenoCheck] = await pool.query(
    `SELECT * FROM admins_gyms WHERE admin_id = ? AND rol = 'DUENO'`,
    [adminId]
  );

  if (duenoCheck.length > 0) {
    throw new AppError('System Policy: Cannot delete a primary OWNER account.', 400);
  }

  // Orchestrated Cleanup
  await pool.query(`DELETE FROM admins_gyms WHERE admin_id = ?`, [adminId]);
  await pool.query(`DELETE FROM admins_perfil WHERE admin_id = ?`, [adminId]);
  await pool.query(`DELETE FROM admins WHERE id = ?`, [adminId]);

  return true;
}
