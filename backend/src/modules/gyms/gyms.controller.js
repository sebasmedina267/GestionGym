import * as gymsService from './gyms.service.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Ensures the request context contains an authenticated administrator.
 * @param {Object} req - Express request object.
 * @throws {AppError} 401 if authentication context is missing.
 */
function validarAdmin(req) {
  if (!req.admin) throw new AppError("Authentication required to access organizational data", 401);
}

/**
 * Validates that a required organizational field is present and correctly formatted.
 * @param {string} valor - Field value to check.
 * @param {string} nombre - Display name of the field for error reporting.
 * @throws {AppError} 400 if validation fails.
 */
function validarCampo(valor, nombre) {
  if (!valor || valor.trim().length === 0) {
    throw new AppError(`${nombre} is a mandatory requirement for this operation`, 400);
  }
}

/* ============================================================
   GYM BRANCH DISCOVERY HANDLERS
   ============================================================ */

/**
 * Retrieves a collection of all gym branches managed by the requesting administrator.
 * Used for dashboard branch-switching and initialization.
 */
export async function listMyGyms(req, res, next) {
  try {
    validarAdmin(req);
    const gyms = await gymsService.listMyGyms(req.admin.id);
    res.status(200).json({ ok: true, data: gyms });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves the global organization branch directory.
 * Includes comparative metadata to identify which branches are already managed by the owner.
 * Security: Restricted to Owner roles.
 */
export async function listAllGyms(req, res, next) {
  try {
    validarAdmin(req);

    const allGyms = await gymsService.listAllGyms();
    const myGyms = await gymsService.listMyGyms(req.admin.id);

    // Hydrate the global list with ownership context
    const gymsWithStatus = allGyms.map(gym => ({
      ...gym,
      isAssigned: myGyms.some(mg => mg.id === gym.id)
    }));

    res.status(200).json({ ok: true, data: gymsWithStatus });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   STRATEGIC EXPANSION HANDLERS
   ============================================================ */

/**
 * Orchestrates the creation of a new gym branch infrastructure.
 * Enforces ownership policies and validates naming conventions.
 */
export async function createGymForOwner(req, res, next) {
  try {
    validarAdmin(req);

    // Authorization policy: Expansion is a Root-level (Owner) operation
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Privilege Violation: Only primary Owners can initialize branch expansion", 403);
    }

    const { nombre, direccion, ciudad, foto, urlWeb } = req.body;

    validarCampo(nombre, "Gym Branch Name");

    const gym = await gymsService.createGymForOwner(req.admin.id, {
      nombre,
      direccion: direccion || null,
      ciudad: ciudad || null,
      foto: foto || null,
      urlWeb: urlWeb || null
    });

    res.status(201).json({ ok: true, data: gym });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PORTFOLIO MANAGEMENT HANDLERS
   ============================================================ */

/**
 * Links an existing branch entity to the owner's operational portfolio.
 */
export async function assignGymToOwner(req, res, next) {
  try {
    validarAdmin(req);

    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Privilege Violation: Branch assignment is restricted to Owners", 403);
    }

    const { gymId } = req.body;

    if (!gymId) {
      throw new AppError("Specific Gym ID target is required for assignment", 400);
    }

    const result = await gymsService.assignGymToOwner(req.admin.id, gymId);

    res.status(200).json({ 
      ok: true, 
      data: result, 
      message: "Branch successfully integrated into your management portfolio" 
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   BRANCH CONFIGURATION HANDLERS
   ============================================================ */

/**
 * Modifies operational or branding parameters for a specific branch.
 */
export async function updateGym(req, res, next) {
  try {
    validarAdmin(req);

    const { id } = req.params;
    const { nombre, direccion, ciudad, foto, urlWeb } = req.body;

    if (!id) {
      throw new AppError("Target branch ID must be specified", 400);
    }

    const updatedGym = await gymsService.updateGym(id, {
      nombre,
      direccion,
      ciudad,
      foto,
      urlWeb
    });

    if (!updatedGym) {
      throw new AppError("Resource not found: The specified branch entity does not exist", 404);
    }

    res.status(200).json({ 
      ok: true, 
      data: updatedGym, 
      message: "Branch configuration successfully updated" 
    });
  } catch (err) {
    next(err);
  }
}
