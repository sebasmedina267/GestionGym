import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   DUEÑOS
============================================================ */

export async function findAnyOwner() {
  const [rows] = await pool.query(
    `SELECT a.* 
     FROM admins a
     JOIN admins_gyms ag ON ag.admin_id = a.id
     WHERE ag.rol = 'DUENO'
     LIMIT 1`
  );
  return rows[0];
}

/* ============================================================
   ADMIN
============================================================ */

export async function createAdmin({ nombre, apellido, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO admins (nombre, apellido, password) VALUES (?, ?, ?)`,
    [nombre, apellido, passwordHash]
  );

  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

export async function findAdminById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE id = ?`,
    [id]
  );
  return rows[0];
}

export async function updatePassword(adminId, passwordHash) {
  await pool.query(
    `UPDATE admins SET password = ? WHERE id = ?`,
    [passwordHash, adminId]
  );
}

export async function updateLastLogin(adminId) {
  await pool.query(
    `UPDATE admins SET ultimo_login = NOW() WHERE id = ?`,
    [adminId]
  );
}

/* ============================================================
   GYMS
============================================================ */

export async function createGym({ nombre, direccion }) {
  const [result] = await pool.query(
    `INSERT INTO gyms (nombre, direccion) VALUES (?, ?)`,
    [nombre, direccion]
  );

  const [rows] = await pool.query(
    `SELECT * FROM gyms WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

export async function gymExists(gymId) {
  const [rows] = await pool.query(
    `SELECT id FROM gyms WHERE id = ?`,
    [gymId]
  );
  return !!rows[0];
}

/* ============================================================
   RELACIÓN ADMIN–GYM
============================================================ */

export async function linkAdminToGym({ adminId, gymId, rol }) {
  // Validar admin
  const admin = await findAdminById(adminId);
  if (!admin) throw new AppError("Administrador no existe", 404);

  // Validar gym
  const gym = await gymExists(gymId);
  if (!gym) throw new AppError("Gym no existe", 404);

  try {
    await pool.query(
      `INSERT INTO admins_gyms (admin_id, gym_id, rol) VALUES (?, ?, ?)`,
      [adminId, gymId, rol]
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("El administrador ya está vinculado a este gym", 400);
    }
    throw err;
  }
}

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

export async function countGymsForAdmin(adminId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM admins_gyms
     WHERE admin_id = ?`,
    [adminId]
  );
  return rows[0].total;
}

export async function getRolesByAdminId(adminId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT rol FROM admins_gyms WHERE admin_id = ?`,
    [adminId]
  );
  return rows.map((r) => r.rol);
}

export async function findOwnerByGymId(gymId) {
  const [rows] = await pool.query(
    `SELECT a.* 
     FROM admins a
     JOIN admins_gyms ag ON ag.admin_id = a.id
     WHERE ag.gym_id = ? AND ag.rol = 'DUENO'
     LIMIT 1`,
    [gymId]
  );
  return rows[0];
}

/* ============================================================
   LOGIN
============================================================ */

export async function findAdminByNombreApellido(nombre, apellido) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE nombre = ? AND apellido = ? AND activo = 1`,
    [nombre, apellido]
  );
  return rows[0];
}

/* ============================================================
   RESET DE CONTRASEÑA
============================================================ */

export async function createPasswordReset({ adminId, token, passwordHash }) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const expiracion = new Date(Date.now() + 1000 * 60 * 30);

    // Guardar token y contraseña temporal
    await conn.query(
      `INSERT INTO password_reset (admin_id, token, expiracion)
       VALUES (?, ?, ?)`,
      [adminId, token, expiracion]
    );

    // NO actualizar contraseña aquí (bug corregido)

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function findPasswordResetByToken(token) {
  const [rows] = await pool.query(
    `SELECT * FROM password_reset WHERE token = ? AND expiracion > NOW()`,
    [token]
  );
  return rows[0];
}

export async function deletePasswordReset(token) {
  await pool.query(
    `DELETE FROM password_reset WHERE token = ?`,
    [token]
  );
}
