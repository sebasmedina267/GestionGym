import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as clientesController from './clientes.controller.js';
import {
  crearClienteSchema,
  actualizarClienteSchema,
  eliminarClienteSchema
} from '../../schemas/clientes.schemas.js';

const router = Router();

/**
 * Client (Member) Management Routes
 * 
 * Orchestrates all operations related to gym members within a specific branch context.
 * Key responsibilities:
 * - Member registry discovery and listing.
 * - Demographic and enrollment analytics.
 * - Onboarding new members (Creation).
 * - Profile synchronization (Updates).
 * - Member offboarding (Deletion).
 * 
 * Requires active authentication and a specific gym branch context.
 */

// Global Guards: All member operations require an active session and branch context
router.use(authMiddleware, gymMiddleware);

/**
 * GET /
 * Retrieves the full member registry for the currently active gym branch.
 */
router.get('/', clientesController.listarClientes);

/**
 * GET /stats
 * Aggregates high-fidelity analytical data about the member base (demographics, retention).
 */
router.get('/stats', clientesController.estadisticasClientes);

/**
 * POST /
 * Executes the onboarding flow for a new gym member.
 * Governed by strict structural validation (crearClienteSchema).
 */
router.post('/', validate(crearClienteSchema), clientesController.crearCliente);

/**
 * PATCH /:id
 * Synchronizes updates for an existing member profile.
 * Supports granular, field-level updates validated by the update schema.
 */
router.patch('/:id', validate(actualizarClienteSchema), clientesController.actualizarCliente);

/**
 * DELETE /:id
 * Permanently removes a member from the organization's branch registry.
 */
router.delete('/:id', validate(eliminarClienteSchema), clientesController.eliminarCliente);

export default router;
