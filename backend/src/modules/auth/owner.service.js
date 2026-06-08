import * as authRepository from "./auth.repository.js";
import { hashPassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { isPaymentSuccessful } from "../stripe/stripe.service.js";
import { AppError } from "../../utils/AppError.js";
import { pool } from "../../config/db.js";
import { validarPassword } from "./auth.service.js";

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

/* ============================================================
   STRIPE PAYMENT INTEGRATION FLOWS
   ============================================================ */

/**
 * Finalizes and activates an owner's administrative account after payment confirmation.
 * This is the post-checkout hook for standard platform onboarding.
 * 
 * SECURITY: Validates that payment was actually successful via Stripe before activating account.
 * TRANSACTIONAL: Ensures payment verification and account activation are atomic.
 * 
 * @param {string} email - The pending owner's email.
 * @param {string} paymentIntentId - Stripe transaction reference.
 * @returns {Promise<Object>} Fully activated session and business data.
 * @throws {AppError} If payment not found, not successful, or activation fails.
 */
export async function confirmOwnerRegistrationAfterPayment(email, paymentIntentId) {
  if (!email || !paymentIntentId) {
    throw new AppError("Email and Payment Intent ID required", 400);
  }

  // SECURITY CHECK: Verify payment was actually successful before activating account
  const paymentSuccessful = await isPaymentSuccessful(paymentIntentId);
  if (!paymentSuccessful) {
    throw new AppError("Payment was not completed or failed. Account cannot be activated.", 402);
  }

  const admin = await authRepository.findAdminByEmailRaw(email);
  if (!admin) throw new AppError("Registration record not found", 404);

  // TRANSACTION: Begin atomic operation
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Activate the account within transaction
    await conn.query(
      "UPDATE admins SET activo = 1 WHERE id = ?",
      [admin.id]
    );

    // Audit payment confirmation within transaction
    await registrarOperacion({
      adminId: admin.id,
      gymId: (await authRepository.getGymsByAdminId(admin.id))[0]?.id,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "CONFIRMACION_PAGO_DUENO",
      detalles: { email, paymentIntentId },
    });

    // COMMIT: If we reach here, payment is confirmed and account activated
    await conn.commit();

    // Fetch updated data after activation
    const updatedAdmin = await authRepository.findAdminByEmailRaw(email);
    const gyms = await authRepository.getGymsByAdminId(updatedAdmin.id);
    const roles = await authRepository.getRolesByAdminId(updatedAdmin.id);

    // Return full session data for immediate login
    const token = signToken({
      id: updatedAdmin.id,
      nombre: updatedAdmin.nombre,
      apellido: updatedAdmin.apellido,
      email: updatedAdmin.email,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    return {
      mensaje: "Payment confirmed, account activated",
      admin: updatedAdmin,
      gyms,
      roles,
      token,
    };
  } catch (err) {
    // ROLLBACK: If any error occurs, account stays inactive
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Provisioning: Creates and links a new business branch for an existing owner.
 * Triggered after a successful "Branch Expansion" payment.
 * 
 * SECURITY: Validates that payment was actually successful via Stripe before creating branch.
 * TRANSACTIONAL: Ensures payment verification and branch creation are atomic.
 * 
 * @param {Object} data - Branch profile and expansion transaction reference.
 * @returns {Promise<Object>} The newly established branch record.
 * @throws {AppError} If payment not successful or branch creation fails.
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

  // SECURITY CHECK: Verify payment was actually successful before creating branch
  const paymentSuccessful = await isPaymentSuccessful(paymentIntentId);
  if (!paymentSuccessful) {
    throw new AppError("Payment was not completed or failed. Branch cannot be created.", 402);
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

    // Audit branch creation
    await registrarOperacion({
      adminId: ownerId,
      gymId: gym.id,
      entidad: "GYM",
      entidadId: gym.id,
      accion: "CREAR_SUCURSAL_PAGO",
      detalles: { nombre, paymentIntentId },
    });

    // COMMIT: If we reach here, all operations succeeded
    await conn.commit();

    return gym;
  } catch (err) {
    // ROLLBACK: If any error occurs, branch creation is reverted
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
