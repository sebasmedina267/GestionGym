import * as adminsRepository from "./admins.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";

export async function listAdminsForMyGyms(ownerId) {
  if (!ownerId) throw new AppError("ID de dueño no proporcionado", 400);

  // Obtener gyms del usuario actual
  const userGyms = await authRepository.getGymsByAdminId(ownerId);
  if (!userGyms || userGyms.length === 0) {
    throw new AppError("Usuario no tiene gyms asignados", 403);
  }

  // Obtener administradores de los gyms del usuario
  const admins = await adminsRepository.findAdminsByOwner(ownerId);

  // Añadir roles y gyms a cada admin
  for (const admin of admins) {
    admin.roles = await authRepository.getRolesByAdminId(admin.id);
    admin.gyms = await authRepository.getGymsByAdminId(admin.id);
  }

  // Auditoría
  await registrarOperacion({
    adminId: ownerId,
    gymId: userGyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: ownerId,
    accion: "CONSULTAR",
    detalles: null,
  });

  return admins;
}

export async function updateAdmin(ownerId, adminId, updateData) {
  if (!ownerId) throw new AppError("ID de dueño no proporcionado", 400);
  if (!adminId) throw new AppError("ID de admin no proporcionado", 400);

  // Validar que el owner es dueño
  const ownerGyms = await authRepository.getGymsByAdminId(ownerId);
  if (!ownerGyms || ownerGyms.length === 0) {
    throw new AppError("Usuario no tiene gyms asignados", 403);
  }

  // Validar que el admin a actualizar pertenece a uno de los gyms del owner
  const targetAdmin = await adminsRepository.findAdminById(adminId);
  if (!targetAdmin) {
    throw new AppError("Administrador no encontrado", 404);
  }

  // Actualizar admin
  const updated = await adminsRepository.updateAdmin(adminId, updateData);

  // Auditoría
  await registrarOperacion({
    adminId: ownerId,
    gymId: ownerGyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: adminId,
    accion: "ACTUALIZAR",
    detalles: `Actualizó datos de admin: ${Object.keys(updateData).join(", ")}`,
  });

  return updated;
}

export async function deleteAdmin(ownerId, adminId) {
  if (!ownerId) throw new AppError("ID de dueño no proporcionado", 400);
  if (!adminId) throw new AppError("ID de admin no proporcionado", 400);

  // Validar que el owner es dueño
  const ownerGyms = await authRepository.getGymsByAdminId(ownerId);
  if (!ownerGyms || ownerGyms.length === 0) {
    throw new AppError("Usuario no tiene gyms asignados", 403);
  }

  // Validar que el admin a eliminar existe
  const targetAdmin = await adminsRepository.findAdminById(adminId);
  if (!targetAdmin) {
    throw new AppError("Administrador no encontrado", 404);
  }

  // Eliminar admin
  await adminsRepository.deleteAdmin(adminId);

  // Auditoría
  await registrarOperacion({
    adminId: ownerId,
    gymId: ownerGyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: adminId,
    accion: "ELIMINAR",
    detalles: `Eliminó admin: ${targetAdmin.nombre} ${targetAdmin.apellido}`,
  });

  return true;
}
