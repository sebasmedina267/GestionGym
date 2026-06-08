import * as economiaService from "./economia.service.js";
import { AppError } from "../../utils/AppError.js";
import { validatePermission } from "../../utils/rolePermissions.js";
import { validateAdminAuthenticated } from "../../utils/auth.utils.js";
import logger from "../../utils/logger.js";
import { LOG_CONTEXT } from "../../constants/index.js";
import * as pdfService from "../../services/pdf.service.js";
import { pool } from "../../config/db.js";

/* ============================================================
   HELPERS
   ============================================================ */

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
    validateAdminAuthenticated(req);
    // RBAC: Ensure the user has viewing rights for financial data
    validatePermission(req.admin.roles, "ECONOMIA", "VER");

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    logger.info(LOG_CONTEXT.REPORT, 'Fetching economic summary', { gymId: req.gym.id, desde, hasta });
    const resumen = await economiaService.resumenEconomico(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: resumen });
  } catch (err) {
    logger.error(LOG_CONTEXT.REPORT, 'Error fetching economic summary', { gymId: req.gym.id, error: err.message });
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
    validateAdminAuthenticated(req);

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
    logger.error(LOG_CONTEXT.REPORT, 'Error creating manual income', { gymId: req.gym.id, error: err.message });
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
    validateAdminAuthenticated(req);

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
    logger.error(LOG_CONTEXT.REPORT, 'Error creating manual expense', { gymId: req.gym.id, error: err.message });
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
    validateAdminAuthenticated(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    logger.info(LOG_CONTEXT.REPORT, 'Fetching income list', { gymId: req.gym.id, desde, hasta });
    const ingresos = await economiaService.listarIngresos(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: ingresos });
  } catch (err) {
    logger.error(LOG_CONTEXT.REPORT, 'Error fetching income list', { gymId: req.gym.id, error: err.message });
    next(err);
  }
}

/**
 * Lists historical recorded expenses for the branch.
 * Supports date range filtering.
 */
export async function listarGastos(req, res, next) {
  try {
    validateAdminAuthenticated(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    logger.info(LOG_CONTEXT.REPORT, 'Fetching expense list', { gymId: req.gym.id, desde, hasta });
    const gastos = await economiaService.listarGastos(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: gastos });
  } catch (err) {
    logger.error(LOG_CONTEXT.REPORT, 'Error fetching expense list', { gymId: req.gym.id, error: err.message });
    next(err);
  }
}

/* ============================================================
   PDF REPORT HANDLERS
   ============================================================ */

/**
 * Generates and downloads a comprehensive financial resume PDF
 */
export async function descargarResumenPDF(req, res, next) {
  try {
    validateAdminAuthenticated(req);
    validatePermission(req.admin.roles, "ECONOMIA", "VER");

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    // Fetch gym information
    const conn = await pool.getConnection();
    const [[gym]] = await conn.query("SELECT * FROM gyms WHERE id = ?", [req.gym.id]);
    conn.release();

    if (!gym) {
      throw new AppError("Gym not found", 404);
    }

    logger.info(LOG_CONTEXT.REPORT, 'Generating Summary PDF', { gymId: req.gym.id, desde, hasta });
    // Fetch financial data
    const resumen = await economiaService.resumenEconomico(req.gym.id, { desde, hasta });
    const ingresos = await economiaService.listarIngresos(req.gym.id, { desde, hasta });
    const gastos = await economiaService.listarGastos(req.gym.id, { desde, hasta });

    // Generate PDF
    const doc = pdfService.generarResumenPDF(
      { resumen, ingresos, gastos },
      gym
    );

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Reporte_Financiero_${gym.nombre}_${new Date().toISOString().split('T')[0]}.pdf"`
    );

    // Stream PDF to response
    doc.pipe(res);
    doc.end();
  } catch (err) {
    logger.error(LOG_CONTEXT.REPORT, 'Error generating summary PDF', { gymId: req.gym.id, error: err.message });
    next(err);
  }
}

/**
 * Generates and downloads an income transactions PDF report
 */
export async function descargarIngresoPDF(req, res, next) {
  try {
    validateAdminAuthenticated(req);
    validatePermission(req.admin.roles, "ECONOMIA", "VER");

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    // Fetch gym information
    const conn = await pool.getConnection();
    const [[gym]] = await conn.query("SELECT * FROM gyms WHERE id = ?", [req.gym.id]);
    conn.release();

    if (!gym) {
      throw new AppError("Gym not found", 404);
    }

    logger.info(LOG_CONTEXT.REPORT, 'Generating Income PDF', { gymId: req.gym.id, desde, hasta });
    // Fetch income data
    const ingresos = await economiaService.listarIngresos(req.gym.id, { desde, hasta });

    // Generate PDF
    const doc = pdfService.generarIngresoPDF(ingresos, gym);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Reporte_Ingresos_${gym.nombre}_${new Date().toISOString().split('T')[0]}.pdf"`
    );

    // Stream PDF to response
    doc.pipe(res);
    doc.end();
  } catch (err) {
    logger.error(LOG_CONTEXT.REPORT, 'Error generating income PDF', { gymId: req.gym.id, error: err.message });
    next(err);
  }
}

/**
 * Generates and downloads an expense transactions PDF report
 */
export async function descargarGastoPDF(req, res, next) {
  try {
    validateAdminAuthenticated(req);
    validatePermission(req.admin.roles, "ECONOMIA", "VER");

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    // Fetch gym information
    const conn = await pool.getConnection();
    const [[gym]] = await conn.query("SELECT * FROM gyms WHERE id = ?", [req.gym.id]);
    conn.release();

    if (!gym) {
      throw new AppError("Gym not found", 404);
    }

    logger.info(LOG_CONTEXT.REPORT, 'Generating Expense PDF', { gymId: req.gym.id, desde, hasta });
    // Fetch expense data
    const gastos = await economiaService.listarGastos(req.gym.id, { desde, hasta });

    // Generate PDF
    const doc = pdfService.generarGastoPDF(gastos, gym);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Reporte_Gastos_${gym.nombre}_${new Date().toISOString().split('T')[0]}.pdf"`
    );

    // Stream PDF to response
    doc.pipe(res);
    doc.end();
  } catch (err) {
    logger.error(LOG_CONTEXT.REPORT, 'Error generating expense PDF', { gymId: req.gym.id, error: err.message });
    next(err);
  }
}
