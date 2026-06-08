import * as authRepository from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";
import { pool } from "../../config/db.js";
import { validarPassword } from "./auth.service.js";

/* ============================================================
   END-USER (APP CLIENT) MANAGEMENT
   ============================================================ */

/**
 * Registers a regular gym member (consumer/client).
 * @param {Object} data - Client personal data and credentials.
 * @returns {Promise<Object>} New user profile and session token.
 */
export async function registerUserFinal({ email, nombre, apellido, password }) {
  if (!email || !nombre || !apellido || !password) {
    throw new AppError("Incomplete registration data", 400);
  }

  validarPassword(password);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Invalid email address", 400);

  if (await authRepository.userFinalEmailExists(email)) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(password);

  // TRANSACTION: Begin atomic operation for user creation and audit logging
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const user = await authRepository.createUserFinal({
      email,
      nombre,
      apellido,
      passwordHash,
    });

    // Audit user registration
    await registrarOperacion({
      adminId: null, // Final users are not linked to admins
      gymId: null,   // Not yet enrolled in any gym
      entidad: "USUARIO_FINAL",
      entidadId: user.id,
      accion: "REGISTRO",
      detalles: { email, nombre, apellido },
    });

    // COMMIT: If we reach here, registration is complete
    await conn.commit();

    const token = signToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      tipo: "USUARIO_FINAL",
    });

    return { user, token };
  } catch (err) {
    // ROLLBACK: If any error occurs, revert user creation
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Authenticates a regular gym member for the consumer mobile/web app.
 * @param {Object} credentials - Email and password.
 * @returns {Promise<Object>} Profile and associated memberships.
 */
export async function loginUserFinal({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const user = await authRepository.findUserFinalByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await comparePassword(password, user.password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const gyms = await authRepository.getGymsForUser(user.id);

  const token = signToken({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    tipo: "USUARIO_FINAL",
    gyms: gyms.map((g) => g.id),
  });

  return { user, gyms, token };
}

/** Authenticates a native client from the dashboard. */
export async function loginClienteNative({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const user = await authRepository.findClienteNativeByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await comparePassword(password, user.password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  // For native clients, we only have one gym associated
  const token = signToken({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    tipo: "USUARIO_FINAL", // We treat them as the same type for the frontend
    gymId: user.gym_id
  });

  return { user, gyms: [{ id: user.gym_id }], token };
}

/**
 * Links an app consumer to a specific gym branch membership.
 * @param {Object} data - Identity and target branch mapping.
 * @returns {Promise<Object>} Success confirmation.
 */
export async function enrollUserInGym({ userId, gymId, metodo_pago = "APP" }) {
  if (!userId || !gymId) {
    throw new AppError("User and gym IDs required", 400);
  }

  const gym = await authRepository.gymExists(gymId);
  if (!gym) throw new AppError("Gym not found", 404);

  const user = await authRepository.findUserFinalById(userId);
  if (!user) throw new AppError("User not found", 404);

  await authRepository.enrollUserInGym({
    userId,
    gymId,
    metodo_pago,
  });

  return { mensaje: "User enrolled successfully" };
}
