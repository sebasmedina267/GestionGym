import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import {
  registerOwnerSchema,
  registerEmployeeSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema
} from '../../schemas/auth.schemas.js';
import { loginLimiter, passwordResetLimiter } from '../../middlewares/rate.middleware.js';

const router = Router();

router.post('/register-owner', validate(registerOwnerSchema), authController.registerOwner);
router.post('/register-employee', authMiddleware, upload.single('foto'), validate(registerEmployeeSchema), authController.registerEmployee);

router.post('/login', loginLimiter, validate(loginSchema), authController.login);

router.post(
  '/password-reset-request',
  passwordResetLimiter,
  validate(passwordResetRequestSchema),
  authController.passwordResetRequest
);

router.post('/password-reset', validate(passwordResetSchema), authController.passwordReset);

export default router;
