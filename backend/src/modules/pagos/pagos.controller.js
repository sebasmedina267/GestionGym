import * as pagosService from './pagos.service.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   HELPERS
============================================================ */

/**
 * Ensures the request is authenticated via an administrator context.
 * @param {Object} req - Express request object.
 * @throws {AppError} 401 if unauthorized.
 */
function validarAdmin(req) {
  if (!req.admin) throw new AppError("Authentication required: Identity context is missing", 401);
}

/**
 * Validates a numeric identifier.
 */
function validarId(id, nombre = "ID") {
  const num = Number(id);
  if (isNaN(num)) throw new AppError(`Invalid format for field: ${nombre}`, 400);
  return num;
}

/**
 * Validates a date string and returns the original if correct.
 */
function validarFecha(fecha, nombre) {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) throw new AppError(`Invalid date provided: ${nombre}`, 400);
  return fecha;
}

/* ============================================================
   PAYMENT RETRIEVAL HANDLERS
============================================================ */

/**
 * Retrieves a filtered list of payments for the current branch.
 * Supports date range and payment method filtering.
 */
export async function listarPagos(req, res, next) {
  try {
    validarAdmin(req);

    const filtros = {
      desde: validarFecha(req.query.desde, "desde"),
      hasta: validarFecha(req.query.hasta, "hasta"),
      metodo: req.query.metodo || null
    };

    const pagos = await pagosService.listarPagos(req.gym.id, filtros);

    res.status(200).json({ ok: true, data: pagos });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves outstanding (unpaid) payments specifically for dashboard visualization.
 */
export async function listarPagosPendientes(req, res, next) {
  try {
    validarAdmin(req);

    const filtros = {
      desde: validarFecha(req.query.desde, "desde"),
      hasta: validarFecha(req.query.hasta, "hasta"),
    };

    const pagosPendientes = await pagosService.listarPagosPendientes(req.gym.id, filtros);

    res.status(200).json({ ok: true, data: pagosPendientes });
  } catch (err) {
    next(err);
  }
}

/**
 * Generates a payment checklist for a specific class and month.
 * Defaults to the current month if not specified.
 */
export async function estadoPagosClase(req, res, next) {
  try {
    validarAdmin(req);
    const claseId = validarId(req.params.claseId, "Clase ID");
    
    // Default to current month (YYYY-MM)
    const mes = req.query.mes || new Date().toISOString().substring(0, 7);
    
    const estado = await pagosService.getEstadoPagosClase(req.gym.id, claseId, mes);
    res.status(200).json({ ok: true, data: estado });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PAYMENT MODIFICATION HANDLERS
============================================================ */

/**
 * Orchestrates the creation of a new payment record.
 * Permission: Authorized for both Owners (DUENO) and Staff (EMPLEADO).
 */
export async function crearPago(req, res, next) {
  try {
    validarAdmin(req);

    if (!req.admin.roles.includes("DUENO") && !req.admin.roles.includes("EMPLEADO")) {
      throw new AppError("Privilege Violation: You are not authorized to register payments", 403);
    }

    const pago = await pagosService.crearPago(
      req.gym.id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: pago });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing payment record.
 * Permission: High-privilege action restricted to Owners (DUENO).
 */
export async function actualizarPago(req, res, next) {
  try {
    validarAdmin(req);

    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Privilege Violation: Only primary Owners can modify historical payment records", 403);
    }

    const id = validarId(req.params.id, "Pago ID");

    const pago = await pagosService.actualizarPago(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(200).json({ ok: true, data: pago });
  } catch (err) {
    next(err);
  }
}
