/**
 * Gyms Client Controller
 * 
 * Handles public/client-facing requests for gym data.
 * No authentication required for most endpoints.
 */

import * as gymsClientService from "./gyms.client.service.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

function validarCoordinadas(latitud, longitud) {
  const lat = parseFloat(latitud);
  const lng = parseFloat(longitud);

  if (isNaN(lat) || isNaN(lng)) {
    throw new AppError("Coordinates must be valid numbers", 400);
  }

  if (lat < -90 || lat > 90) {
    throw new AppError("Latitude must be between -90 and 90", 400);
  }

  if (lng < -180 || lng > 180) {
    throw new AppError("Longitude must be between -180 and 180", 400);
  }

  return { lat, lng };
}

function validarId(id) {
  const num = Number(id);
  if (isNaN(num) || num <= 0) {
    throw new AppError("Invalid gym ID", 400);
  }
  return num;
}

/* ============================================================
   NEARBY GYMS SEARCH
   ============================================================ */

/**
 * Find gyms near user's location
 * 
 * Query params:
 *   - lat: User latitude (required)
 *   - lng: User longitude (required)
 *   - radius: Search radius in km (optional, default: 5)
 * 
 * Response: Array of gyms with distance calculated
 */
export async function findNearbyGyms(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      throw new AppError("Latitude and longitude are required", 400);
    }

    const coords = validarCoordinadas(lat, lng);
    const radiusKm = radius ? Math.min(Math.max(parseFloat(radius), 1), 100) : 5;

    const gyms = await gymsClientService.findNearbyGyms(
      coords.lat,
      coords.lng,
      radiusKm
    );

    res.status(200).json({
      ok: true,
      data: gyms,
      count: gyms.length,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GYM PUBLIC DETAILS
   ============================================================ */

/**
 * Get public details of a specific gym
 * 
 * URL params:
 *   - gymId: Gym identifier (required)
 * 
 * Response: Gym details with stats
 */
export async function getGymDetails(req, res, next) {
  try {
    const gymId = validarId(req.params.gymId);
    const gym = await gymsClientService.getGymPublicDetails(gymId);

    res.status(200).json({
      ok: true,
      data: gym,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GYM CLASSES
   ============================================================ */

/**
 * Get available classes for a gym
 * 
 * URL params:
 *   - gymId: Gym identifier (required)
 * 
 * Response: List of classes with schedules
 */
export async function getGymClasses(req, res, next) {
  try {
    const gymId = validarId(req.params.gymId);
    const classes = await gymsClientService.getGymClasses(gymId);

    res.status(200).json({
      ok: true,
      data: classes,
      count: classes.length,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GYM MACHINES
   ============================================================ */

/**
 * Get machines available at a gym
 * 
 * URL params:
 *   - gymId: Gym identifier (required)
 * 
 * Response: List of machines
 */
export async function getGymMachines(req, res, next) {
  try {
    const gymId = validarId(req.params.gymId);
    const machines = await gymsClientService.getGymMachines(gymId);

    res.status(200).json({
      ok: true,
      data: machines,
      count: machines.length,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GYM PRODUCTS
   ============================================================ */

/**
 * Get products/merchandising for a gym
 * 
 * URL params:
 *   - gymId: Gym identifier (required)
 * 
 * Query params:
 *   - merchandise: Only show merchandising items (optional)
 * 
 * Response: List of products
 */
export async function getGymProducts(req, res, next) {
  try {
    const gymId = validarId(req.params.gymId);
    const onlyMerchandise = req.query.merchandise === "true";

    const products = await gymsClientService.getGymProducts(
      gymId,
      onlyMerchandise
    );

    res.status(200).json({
      ok: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GYM SCHEDULE
   ============================================================ */

/**
 * Get opening hours for a gym
 * 
 * URL params:
 *   - gymId: Gym identifier (required)
 * 
 * Response: Gym schedule
 */
export async function getGymSchedule(req, res, next) {
  try {
    const gymId = validarId(req.params.gymId);
    const schedule = await gymsClientService.getGymSchedule(gymId);

    res.status(200).json({
      ok: true,
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
}
