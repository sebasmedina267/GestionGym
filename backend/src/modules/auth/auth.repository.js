import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   OWNER MANAGEMENT
   ============================================================ */

/**
 * Retrieves the first gym owner found in the database.
 * Useful for checking system state or for simple single-tenant scenarios.
 * @returns {Promise<Object|undefined>} The owner record if found
 */
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
   ADMINISTRATOR ACCOUNT MANAGEMENT
   ============================================================ */

/**
 * Creates a new administrator account (Owner or Employee).
 * @param {Object} data - Name, last name, and hashed password
 * @returns {Promise<Object>} The newly created admin record
 */
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

/**
 * Finds an administrator by their unique ID.
 * @param {number} id - Target admin ID
 * @returns {Promise<Object|undefined>} The admin record
 */
export async function findAdminById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE id = ?`,
    [id]
  );
  return rows[0];
}

/**
 * Updates an administrator's password.
 * @param {number} adminId - Target admin ID
 * @param {string} passwordHash - The new hashed password
 */
export async function updatePassword(adminId, passwordHash) {
  await pool.query(
    `UPDATE admins SET password = ? WHERE id = ?`,
    [passwordHash, adminId]
  );
}

/**
 * Updates the last login timestamp for an administrator.
 * @param {number} adminId - Target admin ID
 */
export async function updateLastLogin(adminId) {
  await pool.query(
    `UPDATE admins SET ultimo_login = NOW() WHERE id = ?`,
    [adminId]
  );
}

/* ============================================================
   GYM BRANCH MANAGEMENT
   ============================================================ */

/**
 * Creates a new gym branch record.
 * @param {Object} data - Branch details (name, address, city, etc.)
 * @returns {Promise<Object>} The newly created gym branch
 */
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

/**
 * Verifies if a gym branch exists by ID.
 * @param {number} gymId - Target gym ID
 * @returns {Promise<boolean>} True if it exists
 */
export async function gymExists(gymId) {
  const [rows] = await pool.query(
    `SELECT id FROM gyms WHERE id = ?`,
    [gymId]
  );
  return !!rows[0];
}

/* ============================================================
   ADMIN-GYM RELATIONSHIP (RBAC)
   ============================================================ */

/**
 * Links an administrator to a specific gym branch with a defined role.
 * Roles: 'DUENO' (Owner), 'EMPLEADO' (Employee).
 * @param {Object} data - Admin ID, Gym ID, and Role
 */
export async function linkAdminToGym({ adminId, gymId, rol }) {
  const admin = await findAdminById(adminId);
  if (!admin) throw new AppError("Administrator does not exist", 404);

  const gym = await gymExists(gymId);
  if (!gym) throw new AppError("Gym branch does not exist", 404);

  try {
    await pool.query(
      `INSERT INTO admins_gyms (admin_id, gym_id, rol) VALUES (?, ?, ?)`,
      [adminId, gymId, rol]
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("Administrator is already linked to this gym branch", 400);
    }
    throw err;
  }
}

/**
 * Retrieves all gym branches associated with an administrator.
 * @param {number} adminId - Target admin ID
 * @returns {Promise<Array>} List of gym branches
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
 * Counts how many gym branches an administrator manages.
 * @param {number} adminId - Target admin ID
 * @returns {Promise<number>} Total branches
 */
export async function countGymsForAdmin(adminId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM admins_gyms
     WHERE admin_id = ?`,
    [adminId]
  );
  return rows[0].total;
}

/**
 * Retrieves all unique roles an administrator holds across branches.
 * @param {number} adminId - Target admin ID
 * @returns {Promise<Array>} List of role strings
 */
export async function getRolesByAdminId(adminId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT rol FROM admins_gyms WHERE admin_id = ?`,
    [adminId]
  );
  return rows.map((r) => r.rol);
}

/** Alias for getRolesByAdminId */
export async function getAdminRole(adminId) {
  return await getRolesByAdminId(adminId);
}

/**
 * Finds the official owner associated with a specific gym branch.
 * @param {number} gymId - Target gym ID
 * @returns {Promise<Object|undefined>} Owner admin record
 */
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
   LEGACY AUTHENTICATION
   ============================================================ */

/**
 * Finds an active administrator by their full name. Deprecated.
 */
export async function findAdminByNombreApellido(nombre, apellido) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE nombre = ? AND apellido = ? AND activo = 1`,
    [nombre, apellido]
  );
  return rows[0];
}

/* ============================================================
   PASSWORD RECOVERY LOGIC
   ============================================================ */

/**
 * Legacy password reset creation. Deprecated.
 */
export async function createPasswordReset({ adminId, token, passwordHash }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const expiracion = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
    await conn.query(
      `INSERT INTO password_reset (admin_id, token, expiracion)
       VALUES (?, ?, ?)`,
      [adminId, token, expiracion]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Retrieves legacy reset token. Deprecated. */
export async function findPasswordResetByToken(token) {
  const [rows] = await pool.query(
    `SELECT * FROM password_reset WHERE token = ? AND expiracion > NOW()`,
    [token]
  );
  return rows[0];
}

/** Deletes legacy reset token. Deprecated. */
export async function deletePasswordReset(token) {
  await pool.query(
    `DELETE FROM password_reset WHERE token = ?`,
    [token]
  );
}

/* ============================================================
   MODERN EMAIL-BASED AUTHENTICATION
   ============================================================ */

/** Creates admin using email as primary identifier. */
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

/** Finds active admin by email. */
export async function findAdminByEmail(email) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE email = ? AND activo = 1`,
    [email]
  );
  return rows[0];
}

/** Finds admin by email regardless of activation status. */
export async function findAdminByEmailRaw(email) {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE email = ?`,
    [email]
  );
  return rows[0];
}

/** Permanently deletes an admin account by email. */
export async function deleteAdminByEmail(email) {
  await pool.query(`DELETE FROM admins WHERE email = ?`, [email]);
}

/** Checks if an email is already associated with any admin account. */
export async function emailExists(email) {
  const [rows] = await pool.query(
    `SELECT id FROM admins WHERE email = ?`,
    [email]
  );
  return !!rows[0];
}

/* ============================================================
   END-USER (CLIENT) REPOSITORY
   ============================================================ */

/** Registers a new gym client. */
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

/** Finds active client by email. */
export async function findUserFinalByEmail(email) {
  const [rows] = await pool.query(
    `SELECT * FROM usuarios_finales WHERE email = ? AND activo = 1`,
    [email]
  );
  return rows[0];
}

/** Checks if email is associated with a client account. */
export async function userFinalEmailExists(email) {
  const [rows] = await pool.query(
    `SELECT id FROM usuarios_finales WHERE email = ?`,
    [email]
  );
  return !!rows[0];
}

/** Links a client to a specific gym branch. */
export async function enrollUserInGym({ userId, gymId, metodo_pago = 'APP' }) {
  const [result] = await pool.query(
    `INSERT INTO usuarios_finales_gimnasios (usuario_id, gym_id, metodo_pago)
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE estado_inscripcion = 'ACTIVO'`,
    [userId, gymId, metodo_pago]
  );
  return result;
}

/** Retrieves all gym branches where a client is actively enrolled. */
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

/* ============================================================
   MODERN RECOVERY REPOSITORY
   ============================================================ */

/** Creates a security token for password recovery (Modern). */
export async function createPasswordResetToken({ email, token, tipo_usuario = 'ADMIN' }) {
  const expiracion = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
  const [result] = await pool.query(
    `INSERT INTO password_reset_tokens (email, token, tipo_usuario, fecha_expiracion)
     VALUES (?, ?, ?, ?)`,
    [email, token, tipo_usuario, expiracion]
  );
  return result.insertId;
}

/** Finds a valid, unused recovery token. */
export async function findPasswordResetToken(token) {
  const [rows] = await pool.query(
    `SELECT * FROM password_reset_tokens 
     WHERE token = ? AND usado = 0 AND fecha_expiracion > NOW()`,
    [token]
  );
  return rows[0];
}

/** Invalidates a recovery token after use. */
export async function usePasswordResetToken(tokenId) {
  await pool.query(
    `UPDATE password_reset_tokens 
     SET usado = 1, fecha_uso = NOW()
     WHERE id = ?`,
    [tokenId]
  );
}

/** Updates client password. */
export async function updateUserFinalPassword(userId, passwordHash) {
  await pool.query(
    `UPDATE usuarios_finales SET password = ? WHERE id = ?`,
    [passwordHash, userId]
  );
}

/** Finds client profile by ID. */
export async function findUserFinalById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, nombre, apellido, foto, activo, tipo_suscripcion FROM usuarios_finales WHERE id = ?`,
    [id]
  );
  return rows[0];
}
