import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import * as adminsController from './admins.controller.js';

const router = Router();

/**
 * Staff (Admin) Management Routes
 * 
 * Handles operations related to gym administrators, instructors, and employees.
 * Restricted to authenticated users with specific roles (DUENO/EMPLEADO).
 */

// All routes require valid session authentication
router.use(authMiddleware);

/**
 * List Staff Members
 * Retrieves all administrators/staff members associated with the current gym branches.
 * Accessible by Owners and Employees.
 */
router.get('/', requireRole('DUENO', 'EMPLEADO'), adminsController.listAdminsForMyGyms);

/**
 * Update Staff Member
 * Modifies an existing staff member's profile, including profile picture upload.
 * Restricted to Owners only.
 */
router.put('/:id', requireRole('DUENO'), upload.single('foto'), adminsController.updateAdmin);

/**
 * Remove Staff Member
 * Deletes a staff member from the gym branch.
 * Restricted to Owners only.
 */
router.delete('/:id', requireRole('DUENO'), adminsController.deleteAdmin);

export default router;
