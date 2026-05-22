/**
 * Gyms Client Service
 * 
 * Business logic for client-facing gym endpoints.
 * Coordinates repository calls and applies any transformations.
 */

import * as gymsClientRepository from "./gyms.client.repository.js";

/* ============================================================
   NEARBY GYMS SEARCH
   ============================================================ */

/**
 * Find gyms within specified radius of user coordinates.
 */
export async function findNearbyGyms(latitud, longitud, radiusKm = 5) {
  const gyms = await gymsClientRepository.findGymsNearby(
    latitud,
    longitud,
    radiusKm
  );

  // Round distance to 2 decimal places for display
  return gyms.map((gym) => ({
    ...gym,
    distancia_km: parseFloat(gym.distancia_km?.toFixed(2) || 0),
  }));
}

/* ============================================================
   GYM PUBLIC DETAILS
   ============================================================ */

/**
 * Get public details of a specific gym.
 */
export async function getGymPublicDetails(gymId) {
  return await gymsClientRepository.findGymPublicDetails(gymId);
}

/* ============================================================
   GYM CLASSES
   ============================================================ */

/**
 * Get available classes for a gym.
 */
export async function getGymClasses(gymId) {
  const classes = await gymsClientRepository.findGymClasses(gymId);

  // Group by class (same class can have multiple schedules)
  const grouped = {};

  classes.forEach((cls) => {
    if (!grouped[cls.id]) {
      grouped[cls.id] = {
        id: cls.id,
        nombre: cls.nombre,
        descripcion: cls.descripcion,
        monitores: cls.monitores || "No asignado",
        precios: cls.precios ? cls.precios.split(",") : [],
        horarios: [],
      };
    }

    if (cls.horario_id) {
      grouped[cls.id].horarios.push({
        id: cls.horario_id,
        inicio: cls.inicio,
        fin: cls.fin,
        aforo_maximo: cls.aforo_maximo,
        inscritos_actuales: cls.inscritos_actuales,
        disponibles: Math.max(0, cls.aforo_maximo - cls.inscritos_actuales),
      });
    }
  });

  return Object.values(grouped);
}

/* ============================================================
   GYM MACHINES
   ============================================================ */

/**
 * Get machines available at a gym.
 */
export async function getGymMachines(gymId) {
  return await gymsClientRepository.findGymMachines(gymId);
}

/* ============================================================
   GYM PRODUCTS
   ============================================================ */

/**
 * Get products/merchandising for a gym.
 */
export async function getGymProducts(gymId, onlyMerchandise = false) {
  return await gymsClientRepository.findGymProducts(gymId, onlyMerchandise);
}

/* ============================================================
   GYM SCHEDULE
   ============================================================ */

/**
 * Get opening hours for a gym.
 */
export async function getGymSchedule(gymId) {
  return await gymsClientRepository.findGymSchedule(gymId);
}
