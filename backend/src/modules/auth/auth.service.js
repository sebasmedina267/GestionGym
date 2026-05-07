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
function validarPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!regex.test(password)) {
    throw new AppError(
      "Password must have at least 8 characters, 1 uppercase, 1 number, and 1 symbol",
      400,
    );
  }
}

/* ============================================================
   GYM OWNER REGISTRATION (BASIC)
   ============================================================ */

/**
 * Legacy owner registration (without email).
 * Orchestrates the creation of an admin account and its primary gym branch.
 * @deprecated Use registerOwnerWithEmail instead for full feature support.
 * @param {Object} data - Owner and Gym base details.
 * @returns {Promise<Object>} Session data including JWT.
 */
export async function registerOwner({
  nombre,
  apellido,
  password,
  gymNombre,
  gymDireccion,
}) {
  if (!nombre || !apellido || !password || !gymNombre) {
    throw new AppError("Incomplete data for owner registration", 400);
  }

  validarPassword(password);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Create administrator account
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Create the gym record
    const gym = await authRepository.createGym({
      nombre: gymNombre,
      direccion: gymDireccion || null,
    });

    // Link administrator to gym with 'OWNER' role
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

    // Log the operation for audit purposes
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
   EMPLOYEE REGISTRATION
   ============================================================ */

/**
 * Registers a new employee for a specific gym branch.
 * Enforces business rules: target gym must have an owner, and employees are single-branch.
 * @param {Object} data - Employee details (name, lastname, password, gymId)
 * @returns {Promise<Object>} The new employee's data and session token.
 */
export async function registerEmployee({ nombre, apellido, password, gymId }) {
  if (!nombre || !apellido || !password || !gymId) {
    throw new AppError("Incomplete data for employee registration", 400);
  }

  validarPassword(password);

  // Verify that the target gym has an owner
  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("No owner exists for this gym", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Create administrator account
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Employees are restricted to a single gym branch
    const gymsPrevios = await authRepository.getGymsByAdminId(admin.id);
    if (gymsPrevios.length > 0) {
      throw new AppError("An employee can only belong to one gym", 400);
    }

    // Link administrator as an employee to the specified gym
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId,
      rol: "EMPLEADO",
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

    // Log registration in audit
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
   MODERN AUTHENTICATION (EMAIL-BASED)
   ============================================================ */

/**
 * Modern owner registration using email.
 * Creates an inactive account that must be activated via payment.
 * Automatically cleans up failed previous attempts for the same email.
 * @param {Object} data - Owner and gym details including optional branding.
 * @returns {Promise<Object>} Tentative session data.
 */
export async function registerOwnerWithEmail({
  nombre,
  apellido,
  email,
  password,
  gymNombre,
  gymDireccion,
  gymUrlWeb,
  gymFoto,
}) {
  console.log(">>> EXECUTING registerOwnerWithEmail v2 <<<");
  if (!nombre || !apellido || !email || !password || !gymNombre) {
    throw new AppError("Incomplete data for owner registration", 400);
  }

  validarPassword(password);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Invalid email address", 400);

  // Check if user already exists
  const existingUser = await authRepository.findAdminByEmailRaw(email);
  if (existingUser) {
    if (existingUser.activo) {
      throw new AppError("Email is already registered and active", 409);
    } else {
      // If inactive, cleanup previous attempt to allow retry
      await authRepository.deleteAdminByEmail(email);
    }
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Create admin account (inactive)
    const admin = await authRepository.createAdminWithEmail({
      nombre,
      apellido,
      email,
      passwordHash,
      activo: false,
    });

    // Create initial gym branch
    const gym = await authRepository.createGym({
      nombre: gymNombre,
      direccion: gymDireccion || null,
      urlWeb: gymUrlWeb || null,
      foto: gymFoto || null,
    });

    // Assign owner role to the gym
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
      email: admin.email,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Audit the registration attempt
    await registrarOperacion({
      adminId: admin.id,
      gymId: gym.id,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REG_DUENO_EMAIL",
      detalles: { nombre, apellido, email },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Activates an owner account after manual verification or standard process.
 * Usually triggered by internal administration or verified webhooks.
 * @param {string} email - Owner email to activate.
 * @returns {Promise<Object>} Success confirmation.
 */
export async function activateOwner(email) {
  if (!email) throw new AppError("Email required", 400);

  const admin = await authRepository.findAdminByEmailRaw(email);
  if (!admin) throw new AppError("Administrator not found", 404);

  if (admin.activo) return { mensaje: "Account is already active" };

  await pool.query("UPDATE admins SET activo = 1 WHERE id = ?", [admin.id]);

  const gyms = await authRepository.getGymsByAdminId(admin.id);

  // Audit the activation
  await registrarOperacion({
    adminId: admin.id,
    gymId: gyms[0]?.id,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "ACTIVACION_PAGO",
    detalles: { email },
  });

  return { mensaje: "Account activated successfully" };
}

/**
 * Registers an employee account using email credentials.
 * Links the employee to a specific gym branch upon creation.
 * @param {Object} data - Employee profile and target branch ID.
 * @returns {Promise<Object>} Authenticated session data.
 */
export async function registerEmployeeWithEmail({
  nombre,
  apellido,
  email,
  password,
  gymId,
  foto,
}) {
  if (!nombre || !apellido || !email || !password || !gymId) {
    throw new AppError("Incomplete data for employee registration", 400);
  }

  validarPassword(password);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Invalid email address", 400);

  if (await authRepository.emailExists(email)) {
    throw new AppError("Email is already registered", 409);
  }

  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("Target gym must have an active owner", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Create employee administrator account
    const admin = await authRepository.createAdminWithEmail({
      nombre,
      apellido,
      email,
      passwordHash,
    });

    // Link as employee role
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId,
      rol: "EMPLEADO",
    });

    await conn.commit();

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

    // Audit registration
    await registrarOperacion({
      adminId: admin.id,
      gymId,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REG_EMP_EMAIL",
      detalles: { nombre, apellido, email },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

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

  const user = await authRepository.createUserFinal({
    email,
    nombre,
    apellido,
    passwordHash,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    tipo: "USUARIO_FINAL",
  });

  return { user, token };
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

/* ============================================================
   STRIPE PAYMENT INTEGRATION FLOWS
   ============================================================ */

/**
 * Finalizes and activates an owner's administrative account after payment confirmation.
 * This is the post-checkout hook for standard platform onboarding.
 * @param {string} email - The pending owner's email.
 * @param {string} paymentIntentId - Stripe transaction reference.
 * @returns {Promise<Object>} Fully activated session and business data.
 */
export async function confirmOwnerRegistrationAfterPayment(email, paymentIntentId) {
  if (!email || !paymentIntentId) {
    throw new AppError("Email and Payment Intent ID required", 400);
  }

  const admin = await authRepository.findAdminByEmailRaw(email);
  if (!admin) throw new AppError("Registration record not found", 404);

  // Activate the account
  await pool.query(
    "UPDATE admins SET activo = 1 WHERE id = ?",
    [admin.id]
  );

  const gyms = await authRepository.getGymsByAdminId(admin.id);
  const roles = await authRepository.getRolesByAdminId(admin.id);

  // Audit payment confirmation
  await registrarOperacion({
    adminId: admin.id,
    gymId: gyms[0]?.id,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "CONFIRMACION_PAGO_DUENO",
    detalles: { email, paymentIntentId },
  });

  // Return full session data for immediate login
  const token = signToken({
    id: admin.id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    email: admin.email,
    roles,
    gyms: gyms.map((g) => g.id),
  });

  return {
    mensaje: "Payment confirmed, account activated",
    admin,
    gyms,
    roles,
    token,
  };
}

/**
 * Provisioning: Creates and links a new business branch for an existing owner.
 * Triggered after a successful "Branch Expansion" payment.
 * @param {Object} data - Branch profile and expansion transaction reference.
 * @returns {Promise<Object>} The newly established branch record.
 */
export async function createBranchAfterPayment({
  ownerId,
  nombre,
  direccion,
  ciudad,
  urlWeb,
  foto,
  paymentIntentId,
}) {
  if (!ownerId || !nombre || !paymentIntentId) {
    throw new AppError("Incomplete data for branch creation", 400);
  }

  const ownerRole = await authRepository.getAdminRole(ownerId);
  if (!ownerRole || !ownerRole.includes("DUENO")) {
    throw new AppError("Only gym owners can purchase additional branches", 403);
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Create the new gym record
    const gym = await authRepository.createGym({
      nombre,
      direccion: direccion || null,
      ciudad: ciudad || null,
      urlWeb: urlWeb || null,
      foto: foto || null,
    });

    // Link current owner to the new branch
    await authRepository.linkAdminToGym({
      adminId: ownerId,
      gymId: gym.id,
      rol: "DUENO",
    });

    await conn.commit();

    // Audit branch creation
    await registrarOperacion({
      adminId: ownerId,
      gymId: gym.id,
      entidad: "GYM",
      entidadId: gym.id,
      accion: "CREAR_SUCURSAL_PAGO",
      detalles: { nombre, paymentIntentId },
    });

    return gym;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
