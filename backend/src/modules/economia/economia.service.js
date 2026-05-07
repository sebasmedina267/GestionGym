import * as economiaRepository from "./economia.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { requireFields } from "../../utils/validators.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   PERMISSION VALIDATION
   ============================================================ */

/**
 * Validates that an administrator has authority to perform financial operations in a gym branch.
 * @param {number} adminId - The administrator's ID.
 * @param {number} gymId - The target gym branch ID.
 * @throws {AppError} 403 if permission is denied.
 */
async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some((g) => g.id === gymId)) {
    throw new AppError("You do not have permission to operate in this gym branch", 403);
  }
}

/* ============================================================
   FINANCIAL SUMMARY SERVICE
   ============================================================ */

/**
 * Aggregates financial totals (Revenue, Expenses, Profit) for a branch.
 * @param {number} gymId - Target branch.
 * @param {Object} range - Filter range ({ desde, hasta }).
 * @returns {Promise<Object>} Calculated financial metrics.
 */
export async function resumenEconomico(gymId, { desde, hasta }) {
  const ingresos = Number(await economiaRepository.totalIngresos(gymId, {
    desde,
    hasta,
  })) || 0;
  
  const gastos = Number(await economiaRepository.totalGastos(gymId, { desde, hasta })) || 0;
  
  const beneficios = ingresos - gastos;

  return { ingresos, gastos, beneficios };
}

/* ============================================================
   MANUAL INCOME SERVICE
   ============================================================ */

/**
 * Persists a manual income record and audits the creation.
 */
export async function crearIngresoManual(gymId, data, admin) {
  requireFields(data, ["descripcion", "importe", "fecha"]);

  if (!admin?.id) throw new AppError("Invalid administrator context", 400);

  await validarPermisos(admin.id, gymId);

  const ingreso = await economiaRepository.insertIngreso({
    gymId,
    fuente_tipo: "MANUAL",
    fuente_id: null,
    descripcion: data.descripcion,
    importe: data.importe,
    fecha: data.fecha,
    adminId: admin.id,
  });

  // Auditing: Record the financial transaction entry
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "INGRESO",
    entidadId: ingreso.id,
    accion: "CREAR",
    detalles: data,
  });

  return ingreso;
}

/* ============================================================
   MANUAL EXPENSE SERVICE
   ============================================================ */

/**
 * Persists a manual expense record and audits the creation.
 */
export async function crearGastoManual(gymId, data, admin) {
  requireFields(data, ["descripcion", "importe", "fecha"]);

  if (!admin?.id) throw new AppError("Invalid administrator context", 400);

  await validarPermisos(admin.id, gymId);

  const gasto = await economiaRepository.insertGasto({
    gymId,
    fuente_tipo: "MANUAL",
    fuente_id: null,
    descripcion: data.descripcion,
    importe: data.importe,
    fecha: data.fecha,
    adminId: admin.id,
  });

  // Auditing: Record the financial transaction entry
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "GASTO",
    entidadId: gasto.id,
    accion: "CREAR",
    detalles: data,
  });

  return gasto;
}

/* ============================================================
   TRANSACTION LISTING SERVICES
   ============================================================ */

/** Retrieves a filtered list of income records */
export async function listarIngresos(gymId, filtros) {
  return economiaRepository.listIngresos(gymId, filtros);
}

/** Retrieves a filtered list of expense records */
export async function listarGastos(gymId, filtros) {
  return economiaRepository.listGastos(gymId, filtros);
}

/* ============================================================
   PERIODIC ANALYTICS SERVICE
   ============================================================ */

/**
 * Aggregates financial data grouped by specific time periods (day, month, year).
 */
export async function estadisticasPorPeriodo(gymId, periodo) {
  if (!["dia", "mes", "anio"].includes(periodo)) {
    throw new AppError("Invalid analytics period requested", 400);
  }

  const ingresos = await economiaRepository.ingresosPorPeriodo(gymId, periodo);
  const gastos = await economiaRepository.gastosPorPeriodo(gymId, periodo);

  return { ingresos, gastos };
}
