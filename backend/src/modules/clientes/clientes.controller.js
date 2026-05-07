import * as clientesService from './clientes.service.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Ensures the request is processed within an authenticated administrative context.
 * @param {Object} req - Express request object.
 * @throws {AppError} 401 if authentication context is missing.
 */
function validarAdmin(req) {
  if (!req.admin) throw new AppError("Authentication required for member management", 401);
}

/**
 * Ensures a provided identifier is a valid numeric value.
 * @param {any} id - The raw ID to validate.
 * @param {string} nombre - Contextual field name for error messaging.
 * @returns {number} The validated numeric identifier.
 * @throws {AppError} 400 if validation fails.
 */
function validarId(id, nombre = "ID") {
  const num = Number(id);
  if (isNaN(num)) throw new AppError(`Invalid format for: ${nombre}`, 400);
  return num;
}

/* ============================================================
   MEMBER LISTING HANDLERS
   ============================================================ */

/**
 * Retrieves the full directory of members associated with the current branch.
 * Operates within the specific 'gym_id' context provided by the gym middleware.
 */
export async function listarClientes(req, res, next) {
  try {
    validarAdmin(req);
    const clientes = await clientesService.listarClientes(req.gym.id);
    res.status(200).json({ ok: true, data: clientes });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ANALYTICS HANDLERS
   ============================================================ */

/**
 * Provides high-fidelity analytical data about the branch's member base.
 * Includes demographic distribution and growth metrics.
 */
export async function estadisticasClientes(req, res, next) {
  try {
    validarAdmin(req);
    const stats = await clientesService.estadisticasClientes(req.gym.id);
    res.status(200).json({ ok: true, data: stats });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   MEMBER ONBOARDING HANDLERS
   ============================================================ */

/**
 * Orchestrates the registration of a new gym member.
 * Pass-through to the service layer for business logic and auditing.
 */
export async function crearCliente(req, res, next) {
  try {
    validarAdmin(req);
    const data = req.body;
    const cliente = await clientesService.crearCliente(
      req.gym.id,
      data,
      req.admin
    );
    res.status(201).json({ ok: true, data: cliente });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   MEMBER UPDATE HANDLERS
   ============================================================ */

/**
 * Persists modifications to an existing member profile.
 * Security: Validates that the target member belongs to the active branch context.
 */
export async function actualizarCliente(req, res, next) {
  try {
    validarAdmin(req);
    const id = validarId(req.params.id, "Member Identifier");
    const data = req.body;
    const cliente = await clientesService.actualizarCliente(
      req.gym.id,
      id,
      data,
      req.admin
    );
    res.status(200).json({ ok: true, data: cliente });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   MEMBER DELETION HANDLERS
   ============================================================ */

/**
 * Permanently removes a member record from the organization's branch registry.
 * Security: This is a high-privilege destructive operation restricted to Owners (DUENO).
 */
export async function eliminarCliente(req, res, next) {
  try {
    validarAdmin(req);

    // Governance: Destructive operations require Root-level organizational authority
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Privilege Violation: Only primary Owners can purge member records", 403);
    }

    const id = validarId(req.params.id, "Member Identifier");

    await clientesService.eliminarCliente(req.gym.id, id, req.admin);

    res.status(200).json({ ok: true, message: "Member record successfully purged from the registry" });
  } catch (err) {
    next(err);
  }
}
