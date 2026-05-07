import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Retrieves the comprehensive equipment inventory for a specific gym branch.
 * @param {number} gymId - The identifier of the branch.
 * @returns {Promise<Array>} Collection of machinery entities.
 */
export async function findByGym(gymId) {
  const [rows] = await pool.query(
    'SELECT * FROM maquinas WHERE gym_id = ?',
    [gymId]
  );
  return rows;
}

/**
 * Persists a new machinery entity to the branch registry.
 * @param {number} gymId - Branch identifier.
 * @param {Object} data - Equipment configuration and asset data.
 * @returns {Promise<Object>} The persisted machinery entity.
 */
export async function create(gymId, data) {
  const {
    nombre,
    descripcion = null,
    uso = null,
    cantidad = 1,
    ubicacion = null,
    foto = null
  } = data;

  const [result] = await pool.query(
    `INSERT INTO maquinas (gym_id, nombre, descripcion, uso, cantidad, ubicacion, foto)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [gymId, nombre, descripcion, uso, cantidad, ubicacion, foto]
  );

  const [rows] = await pool.query(
    'SELECT * FROM maquinas WHERE id = ?',
    [result.insertId]
  );

  return rows[0];
}

/**
 * Synchronizes modifications to an existing equipment record.
 * Uses dynamic field mapping to update only provided attributes.
 * 
 * @param {number} gymId - Branch context for scoping.
 * @param {number} id - Target machinery identifier.
 * @param {Object} data - Partial dataset for modification.
 * @returns {Promise<Object>} The updated machinery entity.
 */
export async function update(gymId, id, data) {
  const fields = [];
  const values = [];

  // Strategic enumeration of updateable machinery attributes
  ['nombre', 'descripcion', 'uso', 'cantidad', 'ubicacion', 'foto'].forEach(field => {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field]);
    }
  });

  if (!fields.length) return getById(gymId, id);

  values.push(gymId, id);

  await pool.query(
    `UPDATE maquinas
     SET ${fields.join(', ')}
     WHERE gym_id = ? AND id = ?`,
    values,
  );

  return getById(gymId, id);
}

/** 
 * Retrieves profile and configuration data for a single equipment entity.
 */
export async function getById(gymId, id) {
  const [rows] = await pool.query(
    'SELECT * FROM maquinas WHERE gym_id = ? AND id = ?',
    [gymId, id]
  );
  return rows[0];
}

/** 
 * Permanently purges an equipment entity from the branch registry.
 */
export async function remove(gymId, id) {
  await pool.query(
    'DELETE FROM maquinas WHERE gym_id = ? AND id = ?',
    [gymId, id]
  );
}
