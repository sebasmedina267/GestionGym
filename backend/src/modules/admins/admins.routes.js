import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import * as adminsController from './admins.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('DUENO', 'TRABAJADOR'), adminsController.listAdminsForMyGyms);

router.put('/:id', requireRole('DUENO'), upload.single('foto'), adminsController.updateAdmin);

router.delete('/:id', requireRole('DUENO'), adminsController.deleteAdmin);

export default router;
