import * as auditRepository from "./audit.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   ACCIONES PERMITIDAS
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
   VALIDAR PERMISOS
============================================================ */

async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some((g) => g.id === gymId)) {
    throw new AppError("El admin no pertenece a este gym", 403);
  }
}

/* ============================================================
   REGISTRAR OPERACION
============================================================ */

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
      throw new AppError("adminId es obligatorio para auditoría", 400);
    if (!gymId) throw new AppError("gymId es obligatorio para auditoría", 400);
    if (!accion) throw new AppError("La acción es obligatoria en auditoría", 400);

    // Validar acción
    const accionLimpia = accion?.trim();
    /*
    if (!ACCIONES_VALIDAS.includes(accionLimpia)) {
      throw new AppError(`Acción de auditoría inválida: ${accionLimpia}`, 400);
    }
    */

    // Validar permisos
    await validarPermisos(adminId, gymId);

    // Registrar auditoría
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
    console.error("ERROR NO CRÍTICO EN AUDITORÍA:", error.message);
    // No relanzamos el error para no interrumpir el flujo principal (ej. registro)
    return null;
  }
}

export async function listMyLogs(adminId) {
  if (!adminId) throw new AppError("adminId requerido", 400);
  return auditRepository.getLogsByAdminId(adminId);
}
