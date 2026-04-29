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
  passwordResetSchema,
  registerUserFinalSchema,
  enrollGymSchema
} from '../../schemas/auth.schemas.js';
import { loginLimiter, passwordResetLimiter } from '../../middlewares/rate.middleware.js';

const router = Router();

router.post('/register-owner', upload.single('gymFoto'), validate(registerOwnerSchema), authController.registerOwner);
router.post('/activate-owner', authController.activateOwner);
router.post('/register-employee', authMiddleware, upload.single('foto'), validate(registerEmployeeSchema), authController.registerEmployee);

router.post('/login', loginLimiter, validate(loginSchema), authController.login);

router.post(
  '/password-reset-request',
  passwordResetLimiter,
  validate(passwordResetRequestSchema),
  authController.passwordResetRequest
);

router.post('/password-reset', validate(passwordResetSchema), authController.passwordReset);

// Rutas Usuario Final (App)
router.post('/user/register', validate(registerUserFinalSchema), authController.registerUserFinal);
router.post('/user/login', loginLimiter, validate(loginSchema), authController.loginUserFinal);
router.post('/user/enroll', authMiddleware, validate(enrollGymSchema), authController.enrollUserGym);

// Rutas de Confirmación de Pago Stripe
router.post('/confirm-owner-payment', authController.confirmOwnerPayment);
router.post('/create-branch-after-payment', authMiddleware, upload.single('foto'), authController.createBranchAfterPayment);

export default router;
