import { pool } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

export async function findAdminsByOwner(ownerId) {
  // Validar que el owner existe y es dueño
  const [ownerRows] = await pool.query(
    `SELECT a.*
     FROM admins a
     JOIN admins_gyms ag ON ag.admin_id = a.id
     WHERE a.id = ? AND ag.rol = 'DUENO' AND a.activo = 1
     LIMIT 1`,
    [ownerId]
  );

  if (!ownerRows[0]) {
    throw new AppError('El administrador no es dueño o no existe', 404);
  }

  // Obtener admins del mismo gym (excluyendo al dueño)
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

export async function findAdminById(adminId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.nombre, a.apellido, a.activo
     FROM admins a
     WHERE a.id = ?`,
    [adminId]
  );

  return rows[0] || null;
}

export async function updateAdmin(adminId, data) {
  const { nombre, apellido, edad, sexo, direccion, foto, gymId } = data;

  // Actualizar tabla admins
  if (nombre || apellido) {
    await pool.query(
      `UPDATE admins SET nombre = COALESCE(?, nombre), apellido = COALESCE(?, apellido)
       WHERE id = ?`,
      [nombre, apellido, adminId]
    );
  }

  // Actualizar tabla admins_perfil
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

  // Si se proporciona gymId, actualizar la asignación de gym
  if (gymId) {
    // Verificar que el admin tiene al menos una asignación de gym
    const [gymAssignments] = await pool.query(
      `SELECT * FROM admins_gyms WHERE admin_id = ?`,
      [adminId]
    );

    if (gymAssignments.length === 0) {
      // Si no tiene ninguna, asignar al nuevo gym como EMPLEADO
      await pool.query(
        `INSERT INTO admins_gyms (admin_id, gym_id, rol) VALUES (?, ?, 'EMPLEADO')`,
        [adminId, gymId]
      );
    } else {
      // Si ya tiene asignaciones, actualizar la primera
      await pool.query(
        `UPDATE admins_gyms SET gym_id = ? WHERE admin_id = ? LIMIT 1`,
        [gymId, adminId]
      );
    }
  }

  return findAdminById(adminId);
}

export async function deleteAdmin(adminId) {
  // Verificar que el admin existe
  const [admin] = await pool.query(
    `SELECT * FROM admins WHERE id = ?`,
    [adminId]
  );

  if (!admin.length) {
    throw new AppError('Administrador no encontrado', 404);
  }

  // Verificar que no es dueño
  const [duenoCheck] = await pool.query(
    `SELECT * FROM admins_gyms WHERE admin_id = ? AND rol = 'DUENO'`,
    [adminId]
  );

  if (duenoCheck.length > 0) {
    throw new AppError('No se puede eliminar al dueño del gimnasio', 400);
  }

  // Eliminar las asignaciones de gym
  await pool.query(
    `DELETE FROM admins_gyms WHERE admin_id = ?`,
    [adminId]
  );

  // Eliminar el perfil
  await pool.query(
    `DELETE FROM admins_perfil WHERE admin_id = ?`,
    [adminId]
  );

  // Eliminar el admin
  await pool.query(
    `DELETE FROM admins WHERE id = ?`,
    [adminId]
  );

  return true;
}
