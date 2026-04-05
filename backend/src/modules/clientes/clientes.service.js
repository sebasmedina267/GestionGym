import * as clientesRepository from "./clientes.repository.js";
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
   ELIMINAR CLIENTES INACTIVOS (4+ MESES)
============================================================ */

async function eliminarClientesInactivosMuchotiempo(gymId) {
  try {
    // Eliminar clientes que han estado inactivos desde hace más de 4 meses
    await clientesRepository.deletePermanentlyInactiveClients(gymId, 4);
  } catch (err) {
    console.error("Error al eliminar clientes inactivos:", err);
  }
}

/* ============================================================
   LISTAR CLIENTES
============================================================ */

export async function listarClientes(gymId) {
  // Eliminar clientes que han estado inactivos más de 4 meses
  await eliminarClientesInactivosMuchotiempo(gymId);
  
  return clientesRepository.findByGym(gymId);
}

/* ============================================================
   ESTADÍSTICAS CLIENTES
=========================================================== */

export async function estadisticasClientes(gymId) {
  const [genero, edad] = await Promise.all([
    clientesRepository.statsGenero(gymId),
    clientesRepository.statsEdad(gymId)
  ]);
  
  return { genero, edad };
}

/* ============================================================
   CREAR CLIENTE
============================================================ */

export async function crearCliente(gymId, data, admin) {
  requireFields(data, ["nombre", "apellido", "edad", "sexo"]);

  if (!admin?.id) throw new AppError("Admin inválido", 400);

  await validarPermisos(admin.id, gymId);

  const cliente = await clientesRepository.create(gymId, data);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: cliente.id,
    accion: "CREAR",
    detalles: data,
  });

  return cliente;
}

/* ============================================================
   ACTUALIZAR CLIENTE
============================================================ */

export async function actualizarCliente(gymId, id, data, admin) {
  if (!admin?.id) throw new AppError("Admin inválido", 400);

  await validarPermisos(admin.id, gymId);

  const cliente = await clientesRepository.getById(gymId, id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  const actualizado = await clientesRepository.update(gymId, id, data);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: id,
    accion: "ACTUALIZAR",
    detalles: data,
  });

  return actualizado;
}

/* ============================================================
   ELIMINAR CLIENTE
============================================================ */

export async function eliminarCliente(gymId, id, admin) {
  if (!admin?.id) throw new AppError("Admin inválido", 400);

  await validarPermisos(admin.id, gymId);

  const cliente = await clientesRepository.getById(gymId, id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  await clientesRepository.remove(gymId, id);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: id,
    accion: "ELIMINAR",
  });
}
