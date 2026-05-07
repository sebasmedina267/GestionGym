import * as gymsRepository from './gyms.repository.js';
import { requireFields } from '../../utils/validators.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Retrieves all gym branches associated with a specific administrator.
 * 
 * @param {number} adminId - The administrator's unique identifier.
 * @returns {Promise<Array>} A collection of gym branch entities.
 */
export async function listMyGyms(adminId) {
  if (!adminId) {
    throw new AppError('Administrator context is missing', 400);
  }

  return gymsRepository.getGymsByAdminId(adminId);
}

/**
 * Retrieves the global directory of all registered gym branches.
 * 
 * @returns {Promise<Array>} A comprehensive list of all gym entities in the platform.
 */
export async function listAllGyms() {
  return gymsRepository.getAllGyms();
}

/**
 * Executes the complex operation of creating a new gym branch 
 * and establishing the requester as the primary owner.
 * 
 * @param {number} adminId - The ID of the owner initializing the expansion.
 * @param {Object} gymData - Core branch properties (branding, location, assets).
 * @returns {Promise<Object>} The successfully created and linked branch entity.
 */
export async function createGymForOwner(adminId, { nombre, direccion, ciudad, foto, urlWeb }) {
  if (!adminId) {
    throw new AppError('Administrator context is required for branch initialization', 400);
  }

  // Integrity Check: Validate mandatory operational fields
  requireFields({ nombre }, ['nombre']);

  // Transaction Layer 1: Instantiate the gym entity
  const gym = await gymsRepository.createGym({
    nombre,
    direccion: direccion || null,
    ciudad: ciudad || null,
    foto: foto || null,
    urlWeb: urlWeb || null
  });

  // Transaction Layer 2: Establish the hierarchical 'DUENO' (Owner) relationship
  await gymsRepository.linkAdminToGym({
    adminId,
    gymId: gym.id,
    rol: 'DUENO'
  });

  return gym;
}

/**
 * Integrates an existing branch into an administrator's operational portfolio.
 * Includes conflict detection to prevent redundant associations.
 * 
 * @param {number} adminId - Target administrator ID.
 * @param {number} gymId - Target branch ID.
 * @returns {Promise<Object>} The integrated branch entity.
 */
export async function assignGymToOwner(adminId, gymId) {
  if (!adminId) {
    throw new AppError('Administrator context is required', 400);
  }

  if (!gymId) {
    throw new AppError('Specific target branch ID is required', 400);
  }

  // Conflict Guard: Verify that the administrator isn't already managing this branch
  const currentPortfolio = await gymsRepository.getGymsByAdminId(adminId);
  if (currentPortfolio.some(g => g.id === gymId)) {
    throw new AppError('Administrative Conflict: You already possess management rights for this branch', 400);
  }

  // Integrity Guard: Verify the target branch infrastructure exists
  const targetBranch = await gymsRepository.getGymById(gymId);
  if (!targetBranch) {
    throw new AppError('Resource Error: The specified branch entity does not exist in the system registry', 404);
  }

  // Persist the administrative link
  await gymsRepository.linkAdminToGym({
    adminId,
    gymId,
    rol: 'DUENO'
  });

  return targetBranch;
}

/**
 * Modifies the core configuration and profile data of a gym branch.
 * 
 * @param {number} gymId - Target branch ID.
 * @param {Object} data - Set of parameters to update.
 * @returns {Promise<Object>} The updated branch profile.
 */
export async function updateGym(gymId, data) {
  if (!gymId) {
    throw new AppError('Specific branch ID is required for configuration updates', 400);
  }

  return gymsRepository.updateGym(gymId, data);
}
