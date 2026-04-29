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

export async function createGym({ nombre, direccion, ciudad, urlWeb, foto }) {
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

export async function getAdminRole(adminId) {
  return await getRolesByAdminId(adminId);
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

/* ============================================================
   NUEVAS FUNCIONES CON EMAIL (PUNTO 2)
============================================================ */

// Crear admin con email
export async function createAdminWithEmail({ nombre, apellido, email, passwordHash, activo = true }) {
  const [result] = await pool.query(
    `INSERT INTO admins (nombre, apellido, email, password, activo) VALUES (?, ?, ?, ?, ?)`,
    [nombre, apellido, email, passwordHash, activo]
  );

  const [rows] = await pool.query(
    `SELECT id, nombre, apellido, email, activo, creado_en FROM admins WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

// Login con email (solo activos)
export async function findAdminByEmail(email) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE email = ? AND activo = 1`,
    [email]
  );
  return rows[0];
}

// Buscar admin por email (incluyendo inactivos)
export async function findAdminByEmailRaw(email) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE email = ?`,
    [email]
  );
  return rows[0];
}

// Eliminar admin por email
export async function deleteAdminByEmail(email) {
  await pool.query(`DELETE FROM admins WHERE email = ?`, [email]);
}

// Validar si email ya existe
export async function emailExists(email) {
  const [rows] = await pool.query(
    `SELECT id FROM admins WHERE email = ?`,
    [email]
  );
  return !!rows[0];
}

// Crear usuario final (usuario de app)
export async function createUserFinal({ email, nombre, apellido, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO usuarios_finales (email, nombre, apellido, password) VALUES (?, ?, ?, ?)`,
    [email, nombre, apellido, passwordHash]
  );

  const [rows] = await pool.query(
    `SELECT id, email, nombre, apellido, activo, tipo_suscripcion FROM usuarios_finales WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

// Buscar usuario final por email
export async function findUserFinalByEmail(email) {
  const [rows] = await pool.query(
    `SELECT * FROM usuarios_finales WHERE email = ? AND activo = 1`,
    [email]
  );
  return rows[0];
}

// Validar si email de usuario final existe
export async function userFinalEmailExists(email) {
  const [rows] = await pool.query(
    `SELECT id FROM usuarios_finales WHERE email = ?`,
    [email]
  );
  return !!rows[0];
}

// Inscribir usuario en gimnasio
export async function enrollUserInGym({ userId, gymId, metodo_pago = 'APP' }) {
  const [result] = await pool.query(
    `INSERT INTO usuarios_finales_gimnasios (usuario_id, gym_id, metodo_pago)
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE estado_inscripcion = 'ACTIVO'`,
    [userId, gymId, metodo_pago]
  );
  return result;
}

// Obtener gimnasios donde usuario está inscrito
export async function getGymsForUser(userId) {
  const [rows] = await pool.query(
    `SELECT g.* 
     FROM gyms g
     JOIN usuarios_finales_gimnasios ufg ON ufg.gym_id = g.id
     WHERE ufg.usuario_id = ? AND ufg.estado_inscripcion = 'ACTIVO'`,
    [userId]
  );
  return rows;
}

// Crear token de reset con nueva tabla
export async function createPasswordResetToken({ email, token, tipo_usuario = 'ADMIN' }) {
  const expiracion = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
  
  const [result] = await pool.query(
    `INSERT INTO password_reset_tokens (email, token, tipo_usuario, fecha_expiracion)
     VALUES (?, ?, ?, ?)`,
    [email, token, tipo_usuario, expiracion]
  );

  return result.insertId;
}

// Validar token de reset
export async function findPasswordResetToken(token) {
  const [rows] = await pool.query(
    `SELECT * FROM password_reset_tokens 
     WHERE token = ? AND usado = 0 AND fecha_expiracion > NOW()`,
    [token]
  );
  return rows[0];
}

// Usar token de reset (marcar como usado)
export async function usePasswordResetToken(tokenId) {
  await pool.query(
    `UPDATE password_reset_tokens 
     SET usado = 1, fecha_uso = NOW()
     WHERE id = ?`,
    [tokenId]
  );
}

// Actualizar contraseña de usuario final
export async function updateUserFinalPassword(userId, passwordHash) {
  await pool.query(
    `UPDATE usuarios_finales SET password = ? WHERE id = ?`,
    [passwordHash, userId]
  );
}

// Obtener usuario final por ID
export async function findUserFinalById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, nombre, apellido, foto, activo, tipo_suscripcion FROM usuarios_finales WHERE id = ?`,
    [id]
  );
  return rows[0];
}
