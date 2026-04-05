import * as economiaRepository from "./economia.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { requireFields } from "../../utils/validators.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   VALIDACIÓN DE PERMISOS
============================================================ */

async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some((g) => g.id === gymId)) {
    throw new AppError("No tienes permiso para operar en este gym", 403);
  }
}

/* ============================================================
   RESUMEN ECONÓMICO
============================================================ */

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
   INGRESO MANUAL
============================================================ */

export async function crearIngresoManual(gymId, data, admin) {
  requireFields(data, ["descripcion", "importe", "fecha"]);

  if (!admin?.id) throw new AppError("Admin inválido", 400);

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
   GASTO MANUAL
============================================================ */

export async function crearGastoManual(gymId, data, admin) {
  requireFields(data, ["descripcion", "importe", "fecha"]);

  if (!admin?.id) throw new AppError("Admin inválido", 400);

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
   LISTADOS
============================================================ */

export async function listarIngresos(gymId, filtros) {
  return economiaRepository.listIngresos(gymId, filtros);
}

export async function listarGastos(gymId, filtros) {
  return economiaRepository.listGastos(gymId, filtros);
}

/* ============================================================
   ESTADÍSTICAS POR PERIODO
============================================================ */

export async function estadisticasPorPeriodo(gymId, periodo) {
  if (!["dia", "mes", "anio"].includes(periodo)) {
    throw new AppError("Periodo inválido", 400);
  }

  const ingresos = await economiaRepository.ingresosPorPeriodo(gymId, periodo);
  const gastos = await economiaRepository.gastosPorPeriodo(gymId, periodo);

  return { ingresos, gastos };
}
