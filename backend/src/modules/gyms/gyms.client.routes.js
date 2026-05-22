/**
 * Gyms Client Routes
 * 
 * Public/client-facing routes for gym discovery and information.
 * Most endpoints do NOT require authentication.
 */

import { Router } from "express";
import * as gymsClientController from "./gyms.client.controller.js";

const router = Router();

/**
 * GET /api/client/gyms/near
 * Find gyms near user's location
 * 
 * Query params:
 *   lat: User latitude (required)
 *   lng: User longitude (required)
 *   radius: Search radius in km (optional, default: 5)
 */
router.get("/near", gymsClientController.findNearbyGyms);

/**
 * GET /api/client/gyms/:gymId/details
 * Get public details of a gym
 */
router.get("/:gymId/details", gymsClientController.getGymDetails);

/**
 * GET /api/client/gyms/:gymId/classes
 * Get available classes for a gym
 */
router.get("/:gymId/classes", gymsClientController.getGymClasses);

/**
 * GET /api/client/gyms/:gymId/machines
 * Get machines at a gym
 */
router.get("/:gymId/machines", gymsClientController.getGymMachines);

/**
 * GET /api/client/gyms/:gymId/products
 * Get products/merchandising for a gym
 * 
 * Query params:
 *   merchandise: true/false - Only show merchandising (optional)
 */
router.get("/:gymId/products", gymsClientController.getGymProducts);

/**
 * GET /api/client/gyms/:gymId/schedule
 * Get opening hours for a gym
 */
router.get("/:gymId/schedule", gymsClientController.getGymSchedule);

export default router;
