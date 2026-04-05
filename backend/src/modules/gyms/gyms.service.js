import * as gymsRepository from './gyms.repository.js';
import { requireFields } from '../../utils/validators.js';
import { AppError } from '../../utils/AppError.js';

/**
 * LISTAR GYMS DEL ADMIN
 */
export async function listMyGyms(adminId) {
  if (!adminId) {
    throw new AppError('ID de administrador requerido', 400);
  }

  return gymsRepository.getGymsByAdminId(adminId);
}

/**
 * LISTAR TODOS LOS GYMS
 */
export async function listAllGyms() {
  return gymsRepository.getAllGyms();
}

/**
 * CREAR GYM PARA UN DUEÑO
 */
export async function createGymForOwner(adminId, { nombre, direccion, ciudad, foto }) {
  if (!adminId) {
    throw new AppError('ID de administrador requerido', 400);
  }

  requireFields({ nombre }, ['nombre']);

  // Crear gym
  const gym = await gymsRepository.createGym({
    nombre,
    direccion: direccion || null,
    ciudad: ciudad || null,
    foto: foto || null
  });

  // Vincular como dueño
  await gymsRepository.linkAdminToGym({
    adminId,
    gymId: gym.id,
    rol: 'DUENO'
  });

  return gym;
}

/**
 * ASIGNAR GYM EXISTENTE AL DUEÑO
 */
export async function assignGymToOwner(adminId, gymId) {
  if (!adminId) {
    throw new AppError('ID de administrador requerido', 400);
  }

  if (!gymId) {
    throw new AppError('ID del gimnasio requerido', 400);
  }

  // Validar que el admin ya no es dueño de este gym
  const gymsActuales = await gymsRepository.getGymsByAdminId(adminId);
  if (gymsActuales.some(g => g.id === gymId)) {
    throw new AppError('Ya eres dueño/responsable de este gimnasio', 400);
  }

  // Validar que el gym existe
  const gymToAssign = await gymsRepository.getGymById(gymId);
  if (!gymToAssign) {
    throw new AppError('Gimnasio no encontrado', 404);
  }

  // Vincular admin al gym existente
  await gymsRepository.linkAdminToGym({
    adminId,
    gymId,
    rol: 'DUENO'
  });

  // Retornar el gym asignado
  const gym = await gymsRepository.getGymById(gymId);
  return gym;
}

/**
 * ACTUALIZAR GYM
 */
export async function updateGym(gymId, data) {
  if (!gymId) {
    throw new AppError('ID del gimnasio requerido', 400);
  }

  return gymsRepository.updateGym(gymId, data);
}
