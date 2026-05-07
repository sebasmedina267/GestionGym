import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as maquinasController from './maquinas.controller.js';
import {
  crearMaquinaSchema,
  actualizarMaquinaSchema
} from '../../schemas/maquinas.schemas.js';

import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

/**
 * Equipment (Inventory) Management Routes
 * 
 * Orchestrates the lifecycle of gym assets and machinery.
 * Key responsibilities:
 * - Asset discovery and inventory listing.
 * - Strategic procurement (Equipment creation with image uploads).
 * - Maintenance tracking and profile updates.
 * - Asset decommissioning (Deletion).
 * 
 * Requires active session authentication and a specific gym branch context.
 */

// Global Guards: Ensure all operations are scoped to a verified user and branch
router.use(authMiddleware, gymMiddleware);

/**
 * GET /
 * Retrieves the comprehensive equipment inventory for the currently selected branch.
 */
router.get('/', maquinasController.listarMaquinas);

/**
 * POST /
 * Registers a new physical asset into the branch inventory.
 * Supports multipart/form-data for high-fidelity equipment imagery.
 */
router.post('/', upload.single('imagen'), validate(crearMaquinaSchema), maquinasController.crearMaquina);

/**
 * PATCH /:id
 * Updates specific configuration or maintenance metadata for an equipment entity.
 * Supports partial updates and image replacements.
 */
router.patch('/:id', upload.single('imagen'), validate(actualizarMaquinaSchema), maquinasController.actualizarMaquina);

/**
 * DELETE /:id
 * Permanently removes an equipment asset from the branch registry.
 */
router.delete('/:id', maquinasController.eliminarMaquina);

export default router;
