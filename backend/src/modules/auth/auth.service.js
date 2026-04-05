import * as authRepository from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";
import crypto from "crypto";
import { pool } from "../../config/db.js";

/* ============================================================
   VALIDACIÓN DE CONTRASEÑA FUERTE
============================================================ */

function validarPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!regex.test(password)) {
    throw new AppError(
      "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo",
      400,
    );
  }
}

/* ============================================================
   REGISTRO DE DUEÑO
============================================================ */

export async function registerOwner({
  nombre,
  apellido,
  password,
  gymNombre,
  gymDireccion,
}) {
  if (!nombre || !apellido || !password || !gymNombre) {
    throw new AppError("Datos incompletos para registrar dueño", 400);
  }

  validarPassword(password);


  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Crear admin
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Crear gym
    const gym = await authRepository.createGym({
      nombre: gymNombre,
      direccion: gymDireccion || null,
    });

    // Vincular admin como dueño
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId: gym.id,
      rol: "DUENO",
    });

    await conn.commit();

    const gyms = await authRepository.getGymsByAdminId(admin.id);
    const roles = await authRepository.getRolesByAdminId(admin.id);

    const token = signToken({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Auditoría
    await registrarOperacion({
      adminId: admin.id,
      gymId: gym.id,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REGISTRO_DUENO",
      detalles: { nombre, apellido },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* ============================================================
   REGISTRO DE EMPLEADO
============================================================ */

export async function registerEmployee({ nombre, apellido, password, gymId }) {
  if (!nombre || !apellido || !password || !gymId) {
    throw new AppError("Datos incompletos para registrar empleado", 400);
  }

  validarPassword(password);

  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("No existe dueño para este gym", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Crear admin
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Validar que el empleado NO tenga otros gyms
    const gymsPrevios = await authRepository.getGymsByAdminId(admin.id);
    if (gymsPrevios.length > 0) {
      throw new AppError("Un empleado solo puede pertenecer a un gym", 400);
    }

    // Vincular admin como trabajador
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId,
      rol: "TRABAJADOR",
    });

    await conn.commit();

    const gyms = await authRepository.getGymsByAdminId(admin.id);
    const roles = await authRepository.getRolesByAdminId(admin.id);

    const token = signToken({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Auditoría
    await registrarOperacion({
      adminId: admin.id,
      gymId,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REGISTRO_EMPLEADO",
      detalles: { nombre, apellido },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* ============================================================
   LOGIN
============================================================ */

export async function login({ nombre, apellido, password }) {
  if (!nombre || !apellido || !password) {
    throw new AppError("Datos incompletos para login", 400);
  }

  const admin = await authRepository.findAdminByNombreApellido(
    nombre,
    apellido,
  );
  if (!admin) throw new AppError("Credenciales inválidas", 401);

  const ok = await comparePassword(password, admin.password);
  if (!ok) throw new AppError("Credenciales inválidas", 401);

  // Actualizar último login
  await authRepository.updateLastLogin(admin.id);

  const gyms = await authRepository.getGymsByAdminId(admin.id);
  const roles = await authRepository.getRolesByAdminId(admin.id);

  const token = signToken({
    id: admin.id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    roles,
    gyms: gyms.map((g) => g.id),
  });

  // Auditoría
  await registrarOperacion({
    adminId: admin.id,
    gymId: gyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "LOGIN",
  });

  return { admin, gyms, roles, token };
}

/* ============================================================
   SOLICITUD DE RESET DE CONTRASEÑA
============================================================ */

export async function passwordResetRequest({ nombre, apellido, newPassword }) {
  if (!nombre || !apellido || !newPassword) {
    throw new AppError("Datos incompletos para resetear contraseña", 400);
  }

  validarPassword(newPassword);

  const admin = await authRepository.findAdminByNombreApellido(
    nombre,
    apellido,
  );
  if (!admin) throw new AppError("Administrador no encontrado", 404);

  const token = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(newPassword);

  await authRepository.createPasswordReset({
    adminId: admin.id,
    token,
    passwordHash,
  });

  console.log("Token reset:", token);

  return { mensaje: "Token generado" };
}

/* ============================================================
   RESETEO DE CONTRASEÑA
============================================================ */

export async function passwordReset({ token }) {
  if (!token) throw new AppError("Token requerido", 400);

  const reset = await authRepository.findPasswordResetByToken(token);
  if (!reset) throw new AppError("Token inválido o expirado", 400);

  // Actualizar contraseña
  await authRepository.updatePassword(reset.admin_id, reset.password_hash);

  // Eliminar token
  await authRepository.deletePasswordReset(token);

  return { mensaje: "Contraseña actualizada correctamente" };
}
