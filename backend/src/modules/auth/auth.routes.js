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

/**
 * Authentication and Authorization Routes
 * 
 * This file defines the API endpoints for user registration, login, 
 * password management, and Stripe payment confirmation.
 */

// --- Owner & Employee Registration ---

/**
 * Register a new gym owner (initial step)
 * Expects a gym logo file ('gymFoto') and validates against registerOwnerSchema.
 * Creates an inactive account that requires payment to activate.
 */
router.post('/register-owner', upload.single('gymFoto'), validate(registerOwnerSchema), authController.registerOwner);

/**
 * Directly activate an owner (used for specific admin flows or internal tools)
 */
router.post('/activate-owner', authController.activateOwner);

/**
 * Register a new employee for a gym
 * Requires authentication and validates against registerEmployeeSchema.
 */
router.post('/register-employee', authMiddleware, upload.single('foto'), validate(registerEmployeeSchema), authController.registerEmployee);

// --- Standard Authentication ---

/**
 * General login for administrators and employees
 * Protected by a rate limiter to prevent brute-force attacks.
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// --- Password Recovery ---

/**
 * Request a password reset link/OTP
 */
router.post(
  '/password-reset-request',
  passwordResetLimiter,
  validate(passwordResetRequestSchema),
  authController.passwordResetRequest
);

/**
 * Execute the password reset using the provided token/OTP
 */
router.post('/password-reset', validate(passwordResetSchema), authController.passwordReset);

// --- End User (Mobile App) Routes ---

/**
 * Register a regular gym member (Client)
 */
router.post('/user/register', validate(registerUserFinalSchema), authController.registerUserFinal);

/**
 * Login for regular gym members
 */
router.post('/user/login', loginLimiter, validate(loginSchema), authController.loginUserFinal);

/**
 * Enroll a user into a specific gym
 * Requires active authentication.
 */
router.post('/user/enroll', authMiddleware, validate(enrollGymSchema), authController.enrollUserGym);

// --- Stripe Payment Confirmation Integration ---

/**
 * Confirm a successful Stripe payment to activate an owner's account
 */
router.post('/confirm-owner-payment', authController.confirmOwnerPayment);

/**
 * Create a new gym branch after a successful branch-specific payment
 * Requires authentication and expects an optional branch photo.
 */
router.post('/create-branch-after-payment', authMiddleware, upload.single('foto'), authController.createBranchAfterPayment);

export default router;
