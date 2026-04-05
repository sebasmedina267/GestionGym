import * as clasesRepository from "./clases.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { requireFields } from "../../utils/validators.js";
import { AppError } from "../../utils/AppError.js";

async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError("No tienes permiso para operar en este gym", 403);
  }
}

export async function listarClases(gymId) {
  return clasesRepository.findByGym(gymId);
}

export async function crearClase(gymId, data, admin) {
  requireFields(data, ["nombre"]);
  await validarPermisos(admin.id, gymId);
  const clase = await clasesRepository.createClase(gymId, data);
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

export async function actualizarClase(gymId, id, data, admin) {
  await validarPermisos(admin.id, gymId);
  const clase = await clasesRepository.getClaseById(gymId, id);
  if (!clase) throw new AppError("Clase no encontrada", 404);
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

export async function eliminarClase(gymId, id, admin) {
  await validarPermisos(admin.id, gymId);
  const clase = await clasesRepository.getClaseById(gymId, id);
  if (!clase) throw new AppError("Clase no encontrada", 404);
  await clasesRepository.deleteClase(gymId, id);
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLASE",
    entidadId: id,
    accion: "ELIMINAR"
  });
}

export async function listarHorarios(gymId, claseId) {
  return clasesRepository.findHorariosByClase(gymId, claseId);
}

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

export async function getClientesDeHorario(gymId, horarioId) {
  return clasesRepository.getClientesByHorario(gymId, horarioId);
}

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

export async function estadisticasClase(gymId, claseId) {
  const [genero, edades, totalClientes] = await Promise.all([
    clasesRepository.statsGeneroClase(gymId, claseId),
    clasesRepository.statsEdadClase(gymId, claseId),
    clasesRepository.totalClientesClase(gymId, claseId)
  ]);
  return { genero, edades, totalClientes };
}

export async function obtenerClasesConCurrencia(gymId) {
  return clasesRepository.clasesConCurrencia(gymId);
}

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
   MONITORES
============================================================ */

export async function listarMonitores(gymId, claseId) {
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Clase no encontrada", 404);
  return clasesRepository.getMonitores(claseId);
}

export async function agregarMonitor(gymId, claseId, monitorId, admin) {
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Clase no encontrada", 404);
  
  // Verificar que el monitor existe
  const monitor = await authRepository.findAdminById(monitorId);
  if (!monitor) throw new AppError("Monitor no encontrado", 404);
  
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

export async function removerMonitor(gymId, claseId, monitorId, admin) {
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Clase no encontrada", 404);
  
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
   PRECIOS
============================================================ */

export async function listarPrecios(gymId, claseId) {
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Clase no encontrada", 404);
  return clasesRepository.getPrecios(claseId);
}

export async function crearPrecio(gymId, claseId, data, admin) {
  requireFields(data, ["nombre", "tipo_unidad", "precio"]);
  await validarPermisos(admin.id, gymId);
  
  const clase = await clasesRepository.getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Clase no encontrada", 404);
  
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

export async function actualizarPrecio(precioId, data, admin) {
  const precio = await clasesRepository.getPrecioById(precioId);
  if (!precio) throw new AppError("Precio no encontrado", 404);
  
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

export async function eliminarPrecio(precioId, admin) {
  const precio = await clasesRepository.getPrecioById(precioId);
  if (!precio) throw new AppError("Precio no encontrado", 404);
  
  await clasesRepository.updatePrecio(precioId, { activo: false });
  
  await registrarOperacion({
    adminId: admin.id,
    entidad: "PRECIO",
    entidadId: precioId,
    accion: "ELIMINAR"
  });
}
