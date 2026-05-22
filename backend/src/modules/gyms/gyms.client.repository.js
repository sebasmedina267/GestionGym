/**
 * Gyms Client Repository
 * 
 * Database queries specific to client/public gym data.
 * Only returns non-sensitive information suitable for public display.
 */

import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   GYM DISCOVERY - GEOLOCATION
   ============================================================ */

/**
 * Finds gyms within a specified radius from user coordinates.
 * 
 * Uses Haversine formula approximation for distance calculation.
 * Returns basic public information only.
 * 
 * @param {number} latitud - User's latitude
 * @param {number} longitud - User's longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 5)
 * @returns {Promise<Array>} Gyms within radius with distance calculated
 */
export async function findGymsNearby(latitud, longitud, radiusKm = 5) {
  // Validate coordinates
  if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
    throw new AppError("Invalid coordinates", 400);
  }

  // Use Haversine formula to calculate distance
  // Formula: d = 2*R*arcsin(sqrt(sin²((lat2-lat1)/2) + cos(lat1)*cos(lat2)*sin²((lon2-lon1)/2)))
  // Simplified: R ≈ 6371 km
  
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.nombre,
        g.direccion,
        g.ciudad,
        g.foto,
        g.latitud,
        g.longitud,
        g.horario_inicio,
        g.horario_fin,
        g.telefono,
        g.email_contacto,
        -- Calculate distance in kilometers
        (6371 * acos(cos(radians(?)) * cos(radians(g.latitud)) * 
         cos(radians(g.longitud) - radians(?)) + 
         sin(radians(?)) * sin(radians(g.latitud)))) AS distancia_km,
        -- Count of active members
        (SELECT COUNT(*) FROM usuarios_finales_gimnasios 
         WHERE gym_id = g.id AND estado_inscripcion = 'ACTIVO') AS miembros_activos,
        -- Count of available classes
        (SELECT COUNT(*) FROM clases WHERE gym_id = g.id) AS total_clases,
        -- Count of machines
        (SELECT COUNT(*) FROM maquinas WHERE gym_id = g.id) AS total_maquinas
     FROM gyms g
     WHERE g.latitud IS NOT NULL 
       AND g.longitud IS NOT NULL
       AND (6371 * acos(cos(radians(?)) * cos(radians(g.latitud)) * 
            cos(radians(g.longitud) - radians(?)) + 
            sin(radians(?)) * sin(radians(g.latitud)))) <= ?
     ORDER BY distancia_km ASC
     LIMIT 50`,
    [latitud, longitud, latitud, latitud, longitud, latitud, radiusKm]
  );

  return rows;
}

/* ============================================================
   GYM PUBLIC DETAILS
   ============================================================ */

/**
 * Retrieves public details of a specific gym.
 * Safe to return to unauthenticated clients.
 * 
 * @param {number} gymId - Gym identifier
 * @returns {Promise<Object>} Gym details with public stats
 */
export async function findGymPublicDetails(gymId) {
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.nombre,
        g.direccion,
        g.ciudad,
        g.foto,
        g.latitud,
        g.longitud,
        g.horario_inicio,
        g.horario_fin,
        g.telefono,
        g.email_contacto,
        (SELECT COUNT(*) FROM usuarios_finales_gimnasios 
         WHERE gym_id = g.id AND estado_inscripcion = 'ACTIVO') AS miembros_activos,
        (SELECT COUNT(*) FROM clases WHERE gym_id = g.id) AS total_clases,
        (SELECT COUNT(*) FROM maquinas WHERE gym_id = g.id) AS total_maquinas,
        (SELECT COUNT(DISTINCT p.id) FROM productos p 
         WHERE p.gym_id = g.id AND p.disponible_para_compra = TRUE) AS total_productos
     FROM gyms g
     WHERE g.id = ?`,
    [gymId]
  );

  if (rows.length === 0) {
    throw new AppError("Gym not found", 404);
  }

  return rows[0];
}

/* ============================================================
   GYM CLASSES (PUBLIC)
   ============================================================ */

/**
 * Retrieves available classes for a gym.
 * Shows class info, schedules, and capacity.
 * 
 * @param {number} gymId - Gym identifier
 * @returns {Promise<Array>} List of classes with schedules
 */
export async function findGymClasses(gymId) {
  const [rows] = await pool.query(
    `SELECT 
        cl.id,
        cl.nombre,
        cl.descripcion,
        ch.id as horario_id,
        ch.inicio,
        ch.fin,
        ch.aforo_maximo,
        (SELECT COUNT(*) FROM clientes_clases 
         WHERE clase_horario_id = ch.id) AS inscritos_actuales,
        (SELECT GROUP_CONCAT(a.nombre SEPARATOR ', ') 
         FROM clases_monitores cm
         JOIN admins a ON cm.admin_id = a.id
         WHERE cm.clase_id = cl.id) AS monitores,
        (SELECT GROUP_CONCAT(p.precio SEPARATOR ', ') 
         FROM precios p WHERE p.clase_id = cl.id AND p.activo = TRUE) AS precios
     FROM clases cl
     LEFT JOIN clases_horarios ch ON cl.id = ch.clase_id
     WHERE cl.gym_id = ?
       AND ch.inicio > NOW()
     ORDER BY ch.inicio ASC`,
    [gymId]
  );

  return rows;
}

/* ============================================================
   GYM MACHINES (PUBLIC)
   ============================================================ */

/**
 * Retrieves machines available at a gym.
 * 
 * @param {number} gymId - Gym identifier
 * @returns {Promise<Array>} List of machines
 */
export async function findGymMachines(gymId) {
  const [rows] = await pool.query(
    `SELECT 
        id,
        nombre,
        descripcion,
        uso,
        cantidad,
        ubicacion,
        foto
     FROM maquinas
     WHERE gym_id = ?
     ORDER BY nombre ASC`,
    [gymId]
  );

  return rows;
}

/* ============================================================
   GYM PRODUCTS (PUBLIC)
   ============================================================ */

/**
 * Retrieves products/merchandising available for purchase at a gym.
 * 
 * @param {number} gymId - Gym identifier
 * @param {boolean} onlyMerchandise - Filter only merchandising items
 * @returns {Promise<Array>} List of products
 */
export async function findGymProducts(gymId, onlyMerchandise = false) {
  const query = onlyMerchandise
    ? `SELECT 
        id,
        nombre,
        descripcion,
        precio,
        foto,
        es_merchandising
     FROM productos
     WHERE gym_id = ? 
       AND disponible_para_compra = TRUE
       AND es_merchandising = TRUE
     ORDER BY nombre ASC`
    : `SELECT 
        id,
        nombre,
        descripcion,
        precio,
        foto,
        es_merchandising
     FROM productos
     WHERE gym_id = ? 
       AND disponible_para_compra = TRUE
     ORDER BY es_merchandising DESC, nombre ASC`;

  const [rows] = await pool.query(query, [gymId]);
  return rows;
}

/* ============================================================
   GYM SCHEDULE
   ============================================================ */

/**
 * Retrieves opening/closing hours for a gym.
 * 
 * @param {number} gymId - Gym identifier
 * @returns {Promise<Object>} Schedule info
 */
export async function findGymSchedule(gymId) {
  const [rows] = await pool.query(
    `SELECT 
        id,
        nombre,
        horario_inicio,
        horario_fin
     FROM gyms
     WHERE id = ?`,
    [gymId]
  );

  if (rows.length === 0) {
    throw new AppError("Gym not found", 404);
  }

  return rows[0];
}
