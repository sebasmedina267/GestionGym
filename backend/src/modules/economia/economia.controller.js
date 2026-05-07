import * as economiaService from "./economia.service.js";
import { AppError } from "../../utils/AppError.js";
import { validatePermission } from "../../utils/rolePermissions.js";

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Ensures the request is coming from an authenticated administrator.
 * @throws {AppError} 401 if not authenticated.
 */
function validarAdmin(req) {
  if (!req.admin) throw new AppError("Not authenticated", 401);
}

/**
 * Validates a date string and ensures it's in a recognizable format.
 * @param {string} fecha - Date string to validate.
 * @param {string} nombre - Field name for error reporting.
 * @returns {string|null} The validated date or null.
 * @throws {AppError} 400 if date is invalid.
 */
function validarFecha(fecha, nombre) {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) throw new AppError(`Invalid date format for: ${nombre}`, 400);
  return fecha;
}

/* ============================================================
   FINANCIAL SUMMARY HANDLER
   ============================================================ */

/**
 * Retrieves an aggregate financial summary for a gym branch.
 * Supports date range filtering via query parameters.
 */
export async function resumenEconomico(req, res, next) {
  try {
    validarAdmin(req);
    // RBAC: Ensure the user has viewing rights for financial data
    validatePermission(req.admin.roles, "ECONOMIA", "VER");

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    const resumen = await economiaService.resumenEconomico(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: resumen });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   INCOME REGISTRATION HANDLER
   ============================================================ */

/**
 * Records a new manual income transaction (e.g., in-person point of sale).
 * Both Owners and Employees are permitted to register income.
 */
export async function crearIngresoManual(req, res, next) {
  try {
    validarAdmin(req);

    // Business Logic: Only Owners and Employees can register income
    if (
      !req.admin.roles.includes("DUENO") &&
      !req.admin.roles.includes("EMPLEADO")
    ) {
      throw new AppError("You do not have permission to register income", 403);
    }

    const ingreso = await economiaService.crearIngresoManual(
      req.gym.id,
      req.body,
      req.admin,
    );

    res.status(201).json({ ok: true, data: ingreso });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   EXPENSE REGISTRATION HANDLER
   ============================================================ */

/**
 * Records a new manual expense transaction.
 * Security: Restricted exclusively to Owners (DUENO) to prevent unauthorized cost reporting.
 */
export async function crearGastoManual(req, res, next) {
  try {
    validarAdmin(req);

    // Policy: Expense registration is a high-privilege operation
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Only branch owners can register expenses", 403);
    }

    const gasto = await economiaService.crearGastoManual(
      req.gym.id,
      req.body,
      req.admin,
    );

    res.status(201).json({ ok: true, data: gasto });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   TRANSACTION LISTING HANDLERS
   ============================================================ */

/**
 * Lists historical income transactions for the branch.
 * Supports date range filtering.
 */
export async function listarIngresos(req, res, next) {
  try {
    validarAdmin(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    const ingresos = await economiaService.listarIngresos(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: ingresos });
  } catch (err) {
    next(err);
  }
}

/**
 * Lists historical recorded expenses for the branch.
 * Supports date range filtering.
 */
export async function listarGastos(req, res, next) {
  try {
    validarAdmin(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    const gastos = await economiaService.listarGastos(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: gastos });
  } catch (err) {
    next(err);
  }
}
