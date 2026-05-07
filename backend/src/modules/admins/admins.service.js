import * as adminsRepository from "./admins.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Lists all staff members associated with the gyms managed by a specific owner.
 * 
 * @param {number} ownerId - The ID of the administrator requesting the list.
 * @returns {Promise<Array>} A list of administrators with their roles and assigned gyms.
 */
export async function listAdminsForMyGyms(ownerId) {
  if (!ownerId) throw new AppError("Owner ID not provided", 400);

  // Retrieve gyms associated with the requesting administrator
  const userGyms = await authRepository.getGymsByAdminId(ownerId);
  if (!userGyms || userGyms.length === 0) {
    throw new AppError("User does not have any assigned gym branches", 403);
  }

  // Retrieve administrators belonging to those gyms
  const admins = await adminsRepository.findAdminsByOwner(ownerId);

  // Hydrate each administrator record with their specific roles and gym associations
  for (const admin of admins) {
    admin.roles = await authRepository.getRolesByAdminId(admin.id);
    admin.gyms = await authRepository.getGymsByAdminId(admin.id);
  }

  // Auditing: Log the query operation
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

/**
 * Updates a staff member's profile.
 * 
 * @param {number} ownerId - The ID of the administrator performing the update.
 * @param {number} adminId - The ID of the staff member being updated.
 * @param {Object} updateData - The new data to be applied.
 */
export async function updateAdmin(ownerId, adminId, updateData) {
  if (!ownerId) throw new AppError("Owner ID not provided", 400);
  if (!adminId) throw new AppError("Staff ID not provided", 400);

  // Verification: Ensure the requester manages at least one gym branch
  const ownerGyms = await authRepository.getGymsByAdminId(ownerId);
  if (!ownerGyms || ownerGyms.length === 0) {
    throw new AppError("Requester does not have any assigned gym branches", 403);
  }

  // Verification: Ensure the target administrator exists
  const targetAdmin = await adminsRepository.findAdminById(adminId);
  if (!targetAdmin) {
    throw new AppError("Staff member not found", 404);
  }

  // Persist the updates
  const updated = await adminsRepository.updateAdmin(adminId, updateData);

  // Auditing: Log the update with details on modified fields
  await registrarOperacion({
    adminId: ownerId,
    gymId: ownerGyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: adminId,
    accion: "ACTUALIZAR",
    detalles: `Updated staff profile fields: ${Object.keys(updateData).join(", ")}`,
  });

  return updated;
}

/**
 * Permanently removes a staff member from the system.
 * 
 * @param {number} ownerId - The ID of the administrator performing the deletion.
 * @param {number} adminId - The ID of the staff member to be removed.
 */
export async function deleteAdmin(ownerId, adminId) {
  if (!ownerId) throw new AppError("Owner ID not provided", 400);
  if (!adminId) throw new AppError("Staff ID not provided", 400);

  // Verification: Ensure the requester has administrative authority
  const ownerGyms = await authRepository.getGymsByAdminId(ownerId);
  if (!ownerGyms || ownerGyms.length === 0) {
    throw new AppError("Requester does not have any assigned gym branches", 403);
  }

  // Verification: Ensure the target exists before attempting deletion
  const targetAdmin = await adminsRepository.findAdminById(adminId);
  if (!targetAdmin) {
    throw new AppError("Staff member not found", 404);
  }

  // Execute deletion
  await adminsRepository.deleteAdmin(adminId);

  // Auditing: Log the deletion with the name of the removed staff member
  await registrarOperacion({
    adminId: ownerId,
    gymId: ownerGyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: adminId,
    accion: "ELIMINAR",
    detalles: `Removed staff member: ${targetAdmin.nombre} ${targetAdmin.apellido}`,
  });

  return true;
}
