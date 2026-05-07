import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Retrieves all gym branches associated with a specific administrator via the junction table.
 * 
 * @param {number} adminId - The unique identifier of the administrator.
 * @returns {Promise<Array>} A collection of gym entities with full metadata.
 */
export async function getGymsByAdminId(adminId) {
  const [rows] = await pool.query(
    `SELECT g.* 
     FROM gyms g
     JOIN admins_gyms ag ON ag.gym_id = g.id
     WHERE ag.admin_id = ?`,
    [adminId]
  );
  return rows;
}

/**
 * Retrieves the global directory of all registered gym branches, ordered alphabetically.
 * 
 * @returns {Promise<Array>} The complete list of all gym branch records.
 */
export async function getAllGyms() {
  const [rows] = await pool.query(`SELECT * FROM gyms ORDER BY nombre ASC`);
  return rows;
}

/**
 * Retrieves identity and configuration data for a single branch by its ID.
 * 
 * @param {number} gymId - The target branch identifier.
 * @returns {Promise<Object|null>} The branch record or null if not found.
 */
export async function getGymById(gymId) {
  const [rows] = await pool.query(
    `SELECT * FROM gyms WHERE id = ?`,
    [gymId]
  );
  return rows[0] || null;
}

/**
 * Persists a new gym branch entity to the system registry.
 * 
 * @param {Object} data - Branch profile data (branding, physical address, web assets).
 * @returns {Promise<Object>} The successfully persisted gym entity with its system ID.
 * @throws {AppError} If mandatory identity fields are missing.
 */
export async function createGym({ nombre, direccion, ciudad, foto, urlWeb }) {
  if (!nombre) throw new AppError('Policy Violation: Branch identity (Name) is mandatory', 400);

  const [result] = await pool.query(
    `INSERT INTO gyms (nombre, direccion, ciudad, foto, url_web) VALUES (?, ?, ?, ?, ?)`,
    [nombre, direccion || null, ciudad || null, foto || null, urlWeb || null]
  );

  const [rows] = await pool.query(
    `SELECT * FROM gyms WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

/**
 * Dynamically updates branch configuration parameters.
 * Only modifies fields explicitly provided in the payload.
 * 
 * @param {number} gymId - Target branch ID.
 * @param {Object} updateData - Partial dataset for modification.
 * @returns {Promise<Object|null>} The post-update branch record.
 */
export async function updateGym(gymId, { nombre, direccion, ciudad, foto, urlWeb }) {
  if (!gymId) throw new AppError('Integrity Error: Target branch ID is mandatory for updates', 400);

  const fields = [];
  const values = [];

  // Dynamic field mapping for optimized SQL generation
  if (nombre !== undefined) {
    fields.push('nombre = ?');
    values.push(nombre);
  }
  if (direccion !== undefined) {
    fields.push('direccion = ?');
    values.push(direccion);
  }
  if (ciudad !== undefined) {
    fields.push('ciudad = ?');
    values.push(ciudad);
  }
  if (foto !== undefined) {
    fields.push('foto = ?');
    values.push(foto);
  }
  if (urlWeb !== undefined) {
    fields.push('url_web = ?');
    values.push(urlWeb);
  }

  if (fields.length === 0) {
    throw new AppError('Payload Error: No updateable fields provided', 400);
  }

  values.push(gymId);

  await pool.query(
    `UPDATE gyms SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  const [rows] = await pool.query(
    `SELECT * FROM gyms WHERE id = ?`,
    [gymId]
  );

  return rows[0] || null;
}

/**
 * Establishes an administrative link between a user and a gym branch.
 * Enforces role-based hierarchy ('DUENO' or 'EMPLEADO').
 * 
 * @param {Object} linkData - Junction mapping (adminId, gymId, rol).
 * @throws {AppError} If the relationship already exists or references are invalid.
 */
export async function linkAdminToGym({ adminId, gymId, rol }) {
  if (!adminId || !gymId || !rol) {
    throw new AppError('Integrity Error: Incomplete junction data for organizational mapping', 400);
  }

  try {
    await pool.query(
      `INSERT INTO admins_gyms (admin_id, gym_id, rol) VALUES (?, ?, ?)`,
      [adminId, gymId, rol]
    );
  } catch (err) {
    // Conflict resolution: Identify specific database constraint violations
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Conflict: This administrator is already associated with the specified branch', 400);
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new AppError('Reference Error: Attempting to link non-existent identity entities', 400);
    }

    throw err;
  }
}
