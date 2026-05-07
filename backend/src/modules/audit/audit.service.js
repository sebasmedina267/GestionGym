import * as auditRepository from "./audit.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   PERMITTED ACTIONS (VALIDATION WHITELIST)
   ============================================================ */

const ACCIONES_VALIDAS = [
  "CREAR",
  "ACTUALIZAR",
  "ELIMINAR",
  "CONSULTAR",
  "LOGIN",
  "COMPRA",
  "VENTA",
  "INSCRIBIR",
  "DESINSCRIBIR",
  "REGISTRO_DUENO",
  "REGISTRO_EMPLEADO",
  "REG_DUENO_EMAIL",
  "REGISTRO_DUENO_EMAIL",
  "REG_EMP_EMAIL",
  "REGISTRO_EMPLEADO_EMAIL",
  "LOGIN_EMAIL",
];

/* ============================================================
   PERMISSION VALIDATION
   ============================================================ */

/**
 * Validates that an administrator has authority to operate within a specific gym branch.
 * @param {number} adminId - The administrator's unique identifier.
 * @param {number} gymId - The target gym branch identifier.
 * @throws {AppError} 403 if the administrator is not linked to the branch.
 */
async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some((g) => g.id === gymId)) {
    throw new AppError("Administrator does not belong to this gym branch", 403);
  }
}

/* ============================================================
   OPERATION LOGGING (AUDIT TRAIL)
   ============================================================ */

/**
 * Persists a detailed operational log for accountability and security tracking.
 * This service is designed to be non-blocking for critical business flows.
 * 
 * @param {Object} data - Log attributes including actor, context, and specifics.
 * @returns {Promise<Object|null>} The persisted log record or null on failure.
 */
export async function registrarOperacion({
  adminId,
  gymId,
  entidad,
  entidadId,
  accion,
  detalles,
}) {
  try {
    console.log('--- DEBUG: registrarOperacion v4 ---');
    if (!adminId)
      throw new AppError("adminId is mandatory for auditing", 400);
    if (!gymId) throw new AppError("gymId is mandatory for auditing", 400);
    if (!accion) throw new AppError("Action is mandatory for auditing", 400);

    const accionLimpia = accion?.trim();
    // Optional: Re-enable whitelist validation if stricter auditing is required
    /*
    if (!ACCIONES_VALIDAS.includes(accionLimpia)) {
      throw new AppError(`Invalid audit action: ${accionLimpia}`, 400);
    }
    */

    // Security Guard: Ensure the actor has jurisdiction over the branch
    await validarPermisos(adminId, gymId);

    // Persist the audit entry
    const log = await auditRepository.insertLog({
      adminId,
      gymId,
      entidad: entidad || null,
      entidadId: entidadId || null,
      accion: accionLimpia,
      detalles: detalles || null,
    });

    return log;
  } catch (error) {
    // Non-Critical Failure: Log error to console but do not disrupt primary user workflows
    console.error("NON-CRITICAL AUDIT ERROR:", error.message);
    return null;
  }
}

/**
 * Retrieves the operational history for a specific administrator.
 * @param {number} adminId - Target administrator ID.
 * @returns {Promise<Array>} List of chronological audit logs.
 */
export async function listMyLogs(adminId) {
  if (!adminId) throw new AppError("adminId is required", 400);
  return auditRepository.getLogsByAdminId(adminId);
}
