import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { auditMiddleware } from '../../middlewares/audit.middleware.js';
import * as gymsController from './gyms.controller.js';

const router = Router();

/**
 * Gym Branch Management API
 * 
 * Orchestrates the lifecycle of gym branches within the organization.
 * Key responsibilities:
 * - Multi-branch discovery and selection.
 * - Strategic expansion (New branch creation).
 * - Administrative configuration of branch profiles.
 * - Owner-level association management.
 */

// All organizational operations require a valid session context
router.use(authMiddleware);

/**
 * GET /
 * Retrieves the subset of gym branches accessible to the authenticated administrator.
 * Primarily used for the 'Select Branch' dashboard entry point.
 */
router.get('/', gymsController.listMyGyms);

/**
 * GET /all
 * System-wide discovery of all organization branches.
 * Security: Restricted to Owners (DUENO) for cross-branch oversight.
 */
router.get('/all', requireRole('DUENO'), gymsController.listAllGyms);

/**
 * POST /create
 * Direct registration of a new gym branch infrastructure.
 * Used during organizational onboarding or strategic scaling.
 */
router.post('/create', requireRole('DUENO'), gymsController.createGymForOwner);

/**
 * POST /assign-gym
 * Links an existing system-level gym entity to the authenticated owner's portfolio.
 */
router.post('/assign-gym', requireRole('DUENO'), gymsController.assignGymToOwner);

/**
 * PATCH /:id
 * Updates specific configuration or branding data for an individual branch.
 * Governance: Requires Owner privileges and triggers a security audit trail.
 */
router.patch('/:id', requireRole('DUENO'), auditMiddleware, gymsController.updateGym);

/**
 * POST / (Hierarchical Creation)
 * Creates a sub-branch while already operating within a parent branch context.
 * Requires active branch selection and owner-level authority.
 */
router.post('/', gymMiddleware, auditMiddleware, requireRole('DUENO'), gymsController.createGymForOwner);

export default router;
