import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import * as auditController from './audit.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', auditController.getMyLogs);

export default router;
