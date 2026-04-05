import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { auditMiddleware } from '../../middlewares/audit.middleware.js';
import * as gymsController from './gyms.controller.js';

const router = Router();

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// GET / → list owner's gyms — does NOT require a gym to be selected yet
router.get('/', gymsController.listMyGyms);

// GET /all → list all gyms (for assigning)
router.get('/all', requireRole('DUENO'), gymsController.listAllGyms);

// POST /create → create a new gym (does NOT require existing gym context for first gym)
router.post('/create', requireRole('DUENO'), gymsController.createGymForOwner);

// POST /assign-gym → assign an existing gym to the owner
router.post('/assign-gym', requireRole('DUENO'), gymsController.assignGymToOwner);

// PATCH /:id → update an existing gym
router.patch('/:id', requireRole('DUENO'), auditMiddleware, gymsController.updateGym);

// POST / → create a new gym — requires an existing gym context
router.post('/', gymMiddleware, auditMiddleware, requireRole('DUENO'), gymsController.createGymForOwner);

export default router;
