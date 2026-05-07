import * as maquinasService from './maquinas.service.js';
import { AppError } from '../../utils/AppError.js';
import { validatePermission } from '../../utils/rolePermissions.js';

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Ensures the request is coming from an authenticated administrator.
 * @throws {AppError} 401 if authentication context is missing.
 */
function validarAdmin(req) {
  if (!req.admin) throw new AppError("Authentication required for equipment management", 401);
}

/**
 * Validates that a provided identifier is a valid numeric value.
 * @param {any} id - Raw ID to validate.
 * @param {string} nombre - Contextual field name.
 * @returns {number} Validated numeric identifier.
 */
function validarId(id, nombre = "ID") {
  const num = Number(id);
  if (isNaN(num)) throw new AppError(`Invalid format for: ${nombre}`, 400);
  return num;
}

/* ============================================================
   EQUIPMENT DISCOVERY HANDLERS
   ============================================================ */

/**
 * Retrieves the complete inventory of equipment for the current branch.
 */
export async function listarMaquinas(req, res, next) {
  try {
    validarAdmin(req);

    const maquinas = await maquinasService.listarMaquinas(req.gym.id);

    res.status(200).json({ ok: true, data: maquinas });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   EQUIPMENT PROCUREMENT HANDLERS
   ============================================================ */

/**
 * Orchestrates the addition of a new equipment asset to the inventory.
 * Handles high-fidelity asset imaging and RBAC validation.
 */
export async function crearMaquina(req, res, next) {
  try {
    validarAdmin(req);
    // RBAC: Verify specific creation rights for equipment
    validatePermission(req.admin.roles, "MAQUINAS", "CREAR");

    // Dynamic asset resolution for uploaded imagery
    if (req.file) {
      req.body.foto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const maquina = await maquinasService.crearMaquina(
      req.gym.id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: maquina });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   MAINTENANCE & CONFIGURATION HANDLERS
   ============================================================ */

/**
 * Persists modifications to an existing equipment entity.
 * Supports image renewal and maintenance metadata synchronization.
 */
export async function actualizarMaquina(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "MAQUINAS", "EDITAR");

    if (req.file) {
      req.body.foto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const id = validarId(req.params.id, "Equipment Identifier");

    const maquina = await maquinasService.actualizarMaquina(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(200).json({ ok: true, data: maquina });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   DECOMMISSIONING HANDLERS
   ============================================================ */

/**
 * Permanently removes an equipment asset from the active branch registry.
 */
export async function eliminarMaquina(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "MAQUINAS", "ELIMINAR");

    const id = validarId(req.params.id, "Equipment Identifier");

    await maquinasService.eliminarMaquina(req.gym.id, id, req.admin);

    res.status(200).json({ ok: true, message: "Equipment asset successfully decommissioned and removed" });
  } catch (err) {
    next(err);
  }
}
