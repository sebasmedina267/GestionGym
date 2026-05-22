/**
 * Client Dashboard Routes
 * 
 * Routes for authenticated end-users (USUARIO_FINAL) to access their
 * gym-related information, classes, and manage their profile.
 * 
 * Requires: authMiddleware for USUARIO_FINAL verification
 */

import { Router } from 'express';
import { clientAuthMiddleware } from '../../middlewares/client.auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as clienteController from './cliente.controller.js';
import {
  enrollClassSchema,
  unenrollClassSchema,
  enrollGymSchema,
  purchaseProductSchema
} from '../../schemas/cliente.schemas.js';

const router = Router();

// All routes require authenticated end-user access (USUARIO_FINAL)
router.use(clientAuthMiddleware);

/* ============================================================
   GYM AFFILIATION
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms
 * Get all gyms where the user is currently enrolled
 */
router.get('/my-gyms', clienteController.getMyGyms);

/**
 * GET /api/client/dashboard/my-gyms/:gymId
 * Get detailed info about a specific enrolled gym
 */
router.get('/my-gyms/:gymId', clienteController.getMyGymDetails);

/**
 * POST /api/client/dashboard/gyms/:gymId/enroll
 * Enroll in a gym (payment via Stripe or pending physical verification)
 */
router.post('/gyms/:gymId/enroll', validate(enrollGymSchema), clienteController.enrollInGym);

/**
 * PUT /api/client/dashboard/my-gyms/:gymId/cancel
 * Cancel enrollment in a gym
 */
router.put('/my-gyms/:gymId/cancel', clienteController.cancelGymEnrollment);

/* ============================================================
   CLASSES - ENROLLED
   ============================================================ */

/**
 * GET /api/client/dashboard/my-classes
 * Get classes the user is currently enrolled in
 * 
 * Query params:
 *   - status: 'upcoming' | 'past' | 'all' (default: 'upcoming')
 */
router.get('/my-classes', clienteController.getMyClasses);

/**
 * POST /api/client/dashboard/classes/:classScheduleId/enroll
 * Enroll in a specific class session
 */
router.post('/classes/:classScheduleId/enroll', validate(enrollClassSchema), clienteController.enrollInClass);

/**
 * DELETE /api/client/dashboard/classes/:classScheduleId/unenroll
 * Cancel enrollment in a specific class session
 */
router.delete('/classes/:classScheduleId/unenroll', validate(unenrollClassSchema), clienteController.unenrollFromClass);

/* ============================================================
   CLASSES - AVAILABLE
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms/:gymId/available-classes
 * Get available classes for an enrolled gym
 * 
 * Query params:
 *   - includeEnrolled: true/false (show classes user is already enrolled in)
 */
router.get('/my-gyms/:gymId/available-classes', clienteController.getAvailableClasses);

/* ============================================================
   MACHINES
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms/:gymId/machines
 * Get machines available at an enrolled gym
 */
router.get('/my-gyms/:gymId/machines', clienteController.getGymMachines);

/* ============================================================
   PRODUCTS & MERCHANDISING
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms/:gymId/products
 * Get products/merchandising available for purchase from an enrolled gym
 * 
 * Query params:
 *   - merchandiseOnly: true/false (only show merchandising items)
 */
router.get('/my-gyms/:gymId/products', clienteController.getGymProducts);

/**
 * POST /api/client/dashboard/products/:productId/purchase
 * Purchase a product (initiate payment)
 */
router.post('/products/:productId/purchase', validate(purchaseProductSchema), clienteController.purchaseProduct);

/* ============================================================
   PROFILE & TRANSACTIONS
   ============================================================ */

/**
 * GET /api/client/dashboard/profile
 * Get user's profile information
 */
router.get('/profile', clienteController.getUserProfile);

/**
 * PATCH /api/client/dashboard/profile
 * Update user's profile information
 */
router.patch('/profile', clienteController.updateUserProfile);

/**
 * GET /api/client/dashboard/transactions
 * Get user's payment/transaction history
 * 
 * Query params:
 *   - gymId: Filter by gym (optional)
 *   - limit: Number of transactions (default: 50)
 *   - offset: Pagination offset (default: 0)
 */
router.get('/transactions', clienteController.getTransactionHistory);

/**
 * GET /api/client/dashboard/transactions/stats
 * Get transaction statistics and summaries
 */
router.get('/transactions/stats', clienteController.getTransactionStats);

export default router;
