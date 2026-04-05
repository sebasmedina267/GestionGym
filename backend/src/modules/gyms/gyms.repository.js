import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Obtiene todos los gyms asociados a un admin
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
 * Obtiene TODOS los gyms
 */
export async function getAllGyms() {
  const [rows] = await pool.query(`SELECT * FROM gyms ORDER BY nombre ASC`);
  return rows;
}

/**
 * Obtiene un gym por ID
 */
export async function getGymById(gymId) {
  const [rows] = await pool.query(
    `SELECT * FROM gyms WHERE id = ?`,
    [gymId]
  );
  return rows[0] || null;
}

/**
 * Crea un gym
 */
export async function createGym({ nombre, direccion, ciudad, foto }) {
  if (!nombre) throw new AppError('El nombre del gym es obligatorio', 400);

  const [result] = await pool.query(
    `INSERT INTO gyms (nombre, direccion, ciudad, foto) VALUES (?, ?, ?, ?)`,
    [nombre, direccion || null, ciudad || null, foto || null]
  );

  const [rows] = await pool.query(
    `SELECT * FROM gyms WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

/**
 * Actualiza un gym
 */
export async function updateGym(gymId, { nombre, direccion, ciudad, foto }) {
  if (!gymId) throw new AppError('ID del gym es obligatorio', 400);

  const fields = [];
  const values = [];

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

  if (fields.length === 0) {
    throw new AppError('No hay campos para actualizar', 400);
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
 * Vincula un admin a un gym con un rol
 */
export async function linkAdminToGym({ adminId, gymId, rol }) {
  if (!adminId || !gymId || !rol) {
    throw new AppError('Datos incompletos para vincular admin a gym', 400);
  }

  try {
    await pool.query(
      `INSERT INTO admins_gyms (admin_id, gym_id, rol) VALUES (?, ?, ?)`,
      [adminId, gymId, rol]
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('El administrador ya está vinculado a este gym', 400);
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new AppError('Admin o Gym no existen', 400);
    }

    throw err;
  }
}
