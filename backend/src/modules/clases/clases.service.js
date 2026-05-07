import * as clasesRepository from "./clases.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { requireFields } from "../../utils/validators.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Validates that an administrator has permission to operate within a specific gym branch.
 */
async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError("You do not have permission to operate in this gym branch", 403);
  }
}

/** Lists all classes defined for a specific gym branch */
export async function listarClases(gymId) {
  return clasesRepository.findByGym(gymId);
}

/**
 * Creates a new class definition and logs the operation.
 */
export async function crearClase(gymId, data, admin) {
  requireFields(data, ["nombre"]);
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.createClase(gymId, data);
  
  // Auditing the creation
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLASE",
    entidadId: clase.id,
    accion: "CREAR",
    detalles: data
  });
  
  return clase;
}

/** Updates an existing class definition and audits the change */
export async function actualizarClase(gymId, id, data, admin) {
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, id);
  if (!clase) throw new AppError("Class not found", 404);
  
  const actualizada = await clasesRepository.updateClase(gymId, id, data);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLASE",
    entidadId: id,
    accion: "ACTUALIZAR",
    detalles: data
  });
  
  return actualizada;
}

/** Removes a class definition and audits the deletion */
export async function eliminarClase(gymId, id, admin) {
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, id);
  if (!clase) throw new AppError("Class not found", 404);
  
  await clasesRepository.deleteClase(gymId, id);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLASE",
    entidadId: id,
    accion: "ELIMINAR"
  });
}

/** Lists the weekly schedule for a specific class */
export async function listarHorarios(gymId, claseId) {
  return clasesRepository.findHorariosByClase(gymId, claseId);
}

/** Creates a new scheduled session for a class */
export async function crearHorario(gymId, claseId, data, admin) {
  requireFields(data, ["inicio", "fin"]);
  await validarPermisos(admin.id, gymId);
  
  const horario = await clasesRepository.createHorario(gymId, claseId, data);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "HORARIO",
    entidadId: horario.id,
    accion: "CREAR",
    detalles: data
  });
  
  return horario;
}

/** Removes a session from the schedule */
export async function eliminarHorario(gymId, horarioId, admin) {
  await validarPermisos(admin.id, gymId);
  
  await clasesRepository.deleteHorario(gymId, horarioId);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "HORARIO",
    entidadId: horarioId,
    accion: "ELIMINAR"
  });
}

/** Retrieves clients enrolled in a specific class session */
export async function getClientesDeHorario(gymId, horarioId) {
  return clasesRepository.getClientesByHorario(gymId, horarioId);
}

/**
 * Enrolls a client in a specific class session.
 */
export async function inscribirClienteEnHorario(gymId, horarioId, clienteId, admin) {
  await validarPermisos(admin.id, gymId);
  
  const inscripcion = await clasesRepository.inscribirClienteEnHorario(
    gymId,
    horarioId,
    clienteId
  );
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "INSCRIPCION",
    entidadId: horarioId,
    accion: "INSCRIBIR",
    detalles: { clienteId }
  });
  
  return inscripcion;
}

/** Removes a client's enrollment from a session */
export async function desinscribirClienteDeHorario(gymId, horarioId, clienteId, admin) {
  await validarPermisos(admin.id, gymId);
  
  await clasesRepository.desinscribirClienteDeHorario(gymId, horarioId, clienteId);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "INSCRIPCION",
    entidadId: horarioId,
    accion: "DESINSCRIBIR",
    detalles: { clienteId }
  });
}

/** Aggregates demographics and attendance statistics for a specific class */
export async function estadisticasClase(gymId, claseId) {
  const [genero, edades, totalClientes] = await Promise.all([
    clasesRepository.statsGeneroClase(gymId, claseId),
    clasesRepository.statsEdadClase(gymId, claseId),
    clasesRepository.totalClientesClase(gymId, claseId)
  ]);
  return { genero, edades, totalClientes };
}

/** Calculates global concurrency levels for all classes in a branch */
export async function obtenerClasesConCurrencia(gymId) {
  return clasesRepository.clasesConCurrencia(gymId);
}

/** Modifies an existing schedule entry */
export async function actualizarHorario(gymId, horarioId, data, admin) {
  requireFields(data, ["inicio", "fin"]);
  await validarPermisos(admin.id, gymId);

  const actualizado = await clasesRepository.updateHorario(
    gymId,
    horarioId,
    data
  );

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "HORARIO",
    entidadId: horarioId,
    accion: "ACTUALIZAR",
    detalles: data
  });

  return actualizado;
}

/* ============================================================
   INSTRUCTOR (MONITOR) MANAGEMENT
   ============================================================ */

/** Lists all instructors qualified or assigned to a class */
export async function listarMonitores(gymId, claseId) {
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Class not found", 404);
  return clasesRepository.getMonitores(claseId);
}

/** Links a new instructor to a specific class type */
export async function agregarMonitor(gymId, claseId, monitorId, admin) {
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Class not found", 404);
  
  const monitor = await authRepository.findAdminById(monitorId);
  if (!monitor) throw new AppError("Instructor not found", 404);
  
  await clasesRepository.addMonitor(claseId, monitorId);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MONITOR",
    entidadId: claseId,
    accion: "ACTUALIZAR",
    detalles: { monitorId }
  });
}

/** Unlinks an instructor from a class type */
export async function removerMonitor(gymId, claseId, monitorId, admin) {
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Class not found", 404);
  
  await clasesRepository.removeMonitor(claseId, monitorId);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MONITOR",
    entidadId: claseId,
    accion: "ACTUALIZAR",
    detalles: { monitorId }
  });
}

/* ============================================================
   PRICING TIER MANAGEMENT
   ============================================================ */

/** Retrieves all pricing options for a class type */
export async function listarPrecios(gymId, claseId) {
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Class not found", 404);
  return clasesRepository.getPrecios(claseId);
}

/** Defines a new pricing tier (e.g. Monthly, Per Session) */
export async function crearPrecio(gymId, claseId, data, admin) {
  requireFields(data, ["nombre", "tipo_unidad", "precio"]);
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Class not found", 404);
  
  const precio = await clasesRepository.createPrecio(claseId, data);
  
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "PRECIO",
    entidadId: precio.id,
    accion: "CREAR",
    detalles: data
  });
  
  return precio;
}

/** Updates specific fields of a pricing tier */
export async function actualizarPrecio(precioId, data, admin) {
  const precio = await clasesRepository.getPrecioById(precioId);
  if (!precio) throw new AppError("Pricing option not found", 404);
  
  const actualizado = await clasesRepository.updatePrecio(precioId, data);
  
  await registrarOperacion({
    adminId: admin.id,
    entidad: "PRECIO",
    entidadId: precioId,
    accion: "ACTUALIZAR",
    detalles: data
  });
  
  return actualizado;
}

/** Soft-deletes a pricing tier by marking it as inactive */
export async function eliminarPrecio(precioId, admin) {
  const precio = await clasesRepository.getPrecioById(precioId);
  if (!precio) throw new AppError("Pricing option not found", 404);
  
  await clasesRepository.updatePrecio(precioId, { activo: false });
  
  await registrarOperacion({
    adminId: admin.id,
    entidad: "PRECIO",
    entidadId: precioId,
    accion: "ELIMINAR"
  });
}
