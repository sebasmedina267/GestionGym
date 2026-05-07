import * as maquinasRepository from './maquinas.repository.js';
import { AppError } from '../../utils/AppError.js';
import { registrarOperacion } from '../audit/audit.service.js';

/* ============================================================
   EQUIPMENT INVENTORY SERVICES
   ============================================================ */

/**
 * Retrieves the full inventory of machinery for a specific branch.
 * @param {number} gymId - Target branch identifier.
 * @returns {Promise<Array>} Collection of equipment records.
 */
export async function listarMaquinas(gymId) {
  return maquinasRepository.findByGym(gymId);
}

/* ============================================================
   ASSET PROCUREMENT SERVICES
   ============================================================ */

/**
 * Orchestrates the acquisition of a new equipment asset.
 * Security: Creation is a high-privilege operation restricted to Owners.
 * 
 * @param {number} gymId - Target branch for the asset.
 * @param {Object} data - Profile and configuration data for the equipment.
 * @param {Object} admin - Identity of the performing administrator.
 */
export async function crearMaquina(gymId, data, admin) {
  // Policy: Only primary Owners can modify the branch's physical capital
  if (!admin.roles.includes("DUENO")) {
    throw new AppError("Privilege Violation: Only branch owners can initialize equipment procurement", 403);
  }

  // Integrity Check: Asset identity is mandatory
  if (!data.nombre || data.nombre.trim().length === 0) {
    throw new AppError("Integrity Error: Equipment nomenclature is mandatory", 400);
  }

  const maquina = await maquinasRepository.create(gymId, data);

  // Audit: Record the addition of physical machinery to the branch assets
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MAQUINA",
    entidadId: maquina.id,
    accion: "CREAR",
    detalles: data
  });

  return maquina;
}

/* ============================================================
   MAINTENANCE & CONFIGURATION SERVICES
   ============================================================ */

/**
 * Synchronizes administrative updates for an existing equipment entity.
 */
export async function actualizarMaquina(gymId, id, data, admin) {
  const maquina = await maquinasRepository.getById(gymId, id);
  if (!maquina) throw new AppError("Resource Error: Equipment asset not found in this branch", 404);

  const updated = await maquinasRepository.update(gymId, id, data);

  // Audit: Log the modification of equipment configuration or state
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MAQUINA",
    entidadId: id,
    accion: "ACTUALIZAR",
    detalles: data
  });

  return updated;
}

/* ============================================================
   ASSET DECOMMISSIONING SERVICES
   ============================================================ */

/**
 * Permanently removes machinery from the branch registry.
 * Security: Destruction of branch assets is restricted to primary Owners.
 */
export async function eliminarMaquina(gymId, id, admin) {
  if (!admin.roles.includes("DUENO")) {
    throw new AppError("Privilege Violation: Only branch owners are authorized to decommission machinery", 403);
  }

  const maquina = await maquinasRepository.getById(gymId, id);
  if (!maquina) throw new AppError("Resource Error: Target equipment asset not found", 404);

  await maquinasRepository.remove(gymId, id);

  // Audit: Securely log the removal of physical capital
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MAQUINA",
    entidadId: id,
    accion: "ELIMINAR",
    detalles: `Decommissioned asset: ${maquina.nombre}`
  });
}
