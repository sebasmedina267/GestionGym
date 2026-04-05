import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

export async function findByGym(gymId) {
  const [rows] = await pool.query(
    'SELECT * FROM maquinas WHERE gym_id = ?',
    [gymId]
  );
  return rows;
}

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

export async function update(gymId, id, data) {
  const fields = [];
  const values = [];

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
    values
  );

  return getById(gymId, id);
}

export async function getById(gymId, id) {
  const [rows] = await pool.query(
    'SELECT * FROM maquinas WHERE gym_id = ? AND id = ?',
    [gymId, id]
  );
  return rows[0];
}

export async function remove(gymId, id) {
  await pool.query(
    'DELETE FROM maquinas WHERE gym_id = ? AND id = ?',
    [gymId, id]
  );
}
