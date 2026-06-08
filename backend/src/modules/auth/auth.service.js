import * as authRepository from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";
import crypto from "crypto";
import { pool } from "../../config/db.js";

/* ============================================================
   PASSWORD STRENGTH VALIDATION
   ============================================================ */

/**
 * Validates that a password meets security requirements.
 * Requirements: 8+ characters, 1 uppercase, 1 number, 1 symbol.
 * @param {string} password - The plain-text password to validate
 * @throws {AppError} If password does not meet requirements
 */
export function validarPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!regex.test(password)) {
    throw new AppError(
      "Password must have at least 8 characters, 1 uppercase, 1 number, and 1 symbol",
      400,
    );
  }
}

/* ============================================================
   LOGIN (NAME-BASED)
   ============================================================ */

/**
 * Authenticates an administrator using first name and last name.
 * @deprecated Use loginWithEmail instead for improved security and uniqueness.
 * @param {Object} credentials - Name and password components.
 * @returns {Promise<Object>} Authenticated session data.
 */
export async function login({ nombre, apellido, password }) {
  if (!nombre || !apellido || !password) {
    throw new AppError("Incomplete login data", 400);
  }

  const admin = await authRepository.findAdminByNombreApellido(
    nombre,
    apellido,
  );
  if (!admin) throw new AppError("Invalid credentials", 401);

  const ok = await comparePassword(password, admin.password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  // Track the successful login time
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

  // Log login event
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
   MODERN AUTHENTICATION (EMAIL-BASED)
   ============================================================ */

/**
 * Authenticates a user using email and password.
 * Hydrates full session context including managed branches and system roles.
 * @param {Object} credentials - Email and password pairing.
 * @returns {Promise<Object>} Authenticated session data.
 */
export async function loginWithEmail({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const admin = await authRepository.findAdminByEmail(email);
  if (!admin) throw new AppError("Invalid credentials", 401);

  const ok = await comparePassword(password, admin.password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  await authRepository.updateLastLogin(admin.id);

  const gyms = await authRepository.getGymsByAdminId(admin.id);
  const roles = await authRepository.getRolesByAdminId(admin.id);

  const token = signToken({
    id: admin.id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    email: admin.email,
    roles,
    gyms: gyms.map((g) => g.id),
  });

  // Audit login
  await registrarOperacion({
    adminId: admin.id,
    gymId: gyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "LOGIN_EMAIL",
  });

  return { admin, gyms, roles, token };
}

/* ============================================================
   LEGACY PASSWORD RESET
   ============================================================ */

/** 
 * Requests a reset using names. 
 * @deprecated Use requestPasswordReset (Email-based) instead.
 */
export async function passwordResetRequest({ nombre, apellido, newPassword }) {
  if (!nombre || !apellido || !newPassword) {
    throw new AppError("Incomplete data for password reset", 400);
  }

  validarPassword(newPassword);

  const admin = await authRepository.findAdminByNombreApellido(
    nombre,
    apellido,
  );
  if (!admin) throw new AppError("Administrator not found", 404);

  const token = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(newPassword);

  await authRepository.createPasswordReset({
    adminId: admin.id,
    token,
    passwordHash,
  });

  console.log("Reset Token generated:", token);

  return { mensaje: "Token generated successfully" };
}

/** 
 * Executes reset using token. 
 * @deprecated Use resetPassword (Modern flow) instead.
 */
export async function passwordReset({ token }) {
  if (!token) throw new AppError("Token required", 400);

  const reset = await authRepository.findPasswordResetByToken(token);
  if (!reset) throw new AppError("Invalid or expired token", 400);

  await authRepository.updatePassword(reset.admin_id, reset.password_hash);
  await authRepository.deletePasswordReset(token);

  return { mensaje: "Password updated successfully" };
}

/* ============================================================
   MODERN PASSWORD RECOVERY
   ============================================================ */

/**
 * Generates a one-time password reset token for any user classification.
 * @param {string} email - The target identity for recovery.
 * @returns {Promise<Object>} Status message (and token for internal/testing).
 */
export async function requestPasswordReset(email) {
  if (!email) throw new AppError("Email required", 400);

  let tipo_usuario = null;
  let user = await authRepository.findAdminByEmail(email);

  if (!user) {
    user = await authRepository.findUserFinalByEmail(email);
    if (user) tipo_usuario = "USUARIO_FINAL";
  } else {
    tipo_usuario = "ADMIN";
  }

  if (!user) {
    // For security, don't confirm if email exists or not
    return { mensaje: "If the email exists, you will receive a recovery link" };
  }

  const token = crypto.randomBytes(32).toString("hex");

  await authRepository.createPasswordResetToken({
    email,
    token,
    tipo_usuario,
  });

  // In production, this token would be sent via email service
  return { mensaje: "Recovery email sent", token };
}

/**
 * Updates an identity's password using a validated reset token.
 * Consumes the token upon successful update.
 * @param {Object} data - Verification token and new credential.
 * @returns {Promise<Object>} Success confirmation.
 */
export async function resetPassword({ token, newPassword }) {
  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  validarPassword(newPassword);

  const resetToken = await authRepository.findPasswordResetToken(token);
  if (!resetToken) throw new AppError("Invalid or expired token", 400);

  const passwordHash = await hashPassword(newPassword);

  // Update password based on user classification
  if (resetToken.tipo_usuario === "ADMIN") {
    const admin = await authRepository.findAdminByEmail(resetToken.email);
    if (!admin) throw new AppError("Administrator not found", 404);
    await authRepository.updatePassword(admin.id, passwordHash);
  } else if (resetToken.tipo_usuario === "USUARIO_FINAL") {
    const user = await authRepository.findUserFinalByEmail(resetToken.email);
    if (!user) throw new AppError("User not found", 404);
    await authRepository.updateUserFinalPassword(user.id, passwordHash);
  }

  // Consume the token (one-time use)
  await authRepository.usePasswordResetToken(resetToken.id);

  return { mensaje: "Password updated successfully" };
}
