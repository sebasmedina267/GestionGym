import * as authService from "./auth.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Register a new gym owner
 * 
 * This is the first step of the owner registration process.
 * After successful registration, the user is redirected to complete payment
 * (subscriptionPaymentHandler handles that).
 * 
 * Workflow:
 *   1. Owner submits registration details + gym info
 *   2. This handler validates and creates account record
 *   3. User is pending activation until payment completes
 *   4. Frontend redirects to Stripe checkout with email
 *   5. After payment success, confirmOwnerPayment activates account
 * 
 * Request body:
 *   - nombre: {string} Owner's first name
 *   - apellido: {string} Owner's last name
 *   - email: {string} Owner's email (must be unique)
 *   - password: {string} Account password (min 8 chars, 1 upper, 1 digit, 1 symbol)
 *   - gymNombre: {string} Name of the gym
 *   - gymDireccion: {string} [optional] Gym street address
 *   - gymUrlWeb: {string} [optional] Gym website
 *   - gymFoto: {file} [optional] Gym logo/photo
 * 
 * Response (201 Created):
 *   - ok: true
 *   - data: { admin, gyms, roles, token, ... }
 *     - token: JWT for frontend session (if immediate login desired)
 * 
 * Errors:
 *   - 400: Incomplete data, weak password, or email already registered
 *   - 409: Email already active in system
 *   - 500: Database error
 */
export async function registerOwner(req, res, next) {
  try {
    const { nombre, apellido, email, password, gymNombre, gymDireccion, gymUrlWeb } = req.body;
    const gymFoto = req.file?.filename || null;

    const result = await authService.registerOwnerWithEmail({
      nombre,
      apellido,
      email,
      password,
      gymNombre,
      gymDireccion,
      gymUrlWeb,
      gymFoto,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}


/**
 * Activate a pending owner account after payment
 * 
 * Called after successful Stripe payment to mark an owner account as active.
 * This completes the registration flow started by registerOwner.
 * 
 * Security: Should verify payment_intent status before activation
 * (currently lacks this validation - identified as potential issue)
 * 
 * Request body:
 *   - email: {string} Owner's email address
 * 
 * Response (200 OK):
 *   - ok: true
 *   - message: Confirmation message
 * 
 * Errors:
 *   - 400: Email not found or already activated
 *   - 500: Database error
 * 
 * TODO: Add payment status verification before activation
 */
export async function activateOwner(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.activateOwner(email);
    res.status(200).json({ ok: true, message: result.mensaje });
  } catch (err) {
    next(err);
  }
}



/**
 * Register a new employee for a gym
 * 
 * Creates a new employee account linked to a specific gym.
 * Only gym owners can create employees for their own gyms.
 * 
 * Authorization: Requires DUENO (owner) role
 * 
 * Request body:
 *   - nombre: {string} Employee's first name
 *   - apellido: {string} Employee's last name
 *   - email: {string} Employee's email (must be unique)
 *   - password: {string} Initial password
 *   - gymId: {number} Target gym ID (must belong to authenticated owner)
 *   - foto: {file} [optional] Employee photo
 * 
 * Response (201 Created):
 *   - ok: true
 *   - data: { admin, gyms, roles, token }
 * 
 * Errors:
 *   - 401: Not authenticated
 *   - 403: User is not a gym owner
 *   - 400: Incomplete data or invalid gym
 *   - 500: Database error
 * 
 * Security notes:
 *   - Should verify that gymId belongs to the authenticated owner
 *   - Currently limited validation on gym ownership
 */
export async function registerEmployee(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);

    // Only a gym owner can create employees
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Only a gym owner can register employees", 403);
    }

    const { nombre, apellido, email, password, gymId } = req.body;
    const foto = req.file?.filename || null;

    const result = await authService.registerEmployeeWithEmail({
      nombre,
      apellido,
      email,
      password,
      gymId: Number(gymId),
      foto,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}


/**
 * Authenticate user and return JWT token
 * 
 * Validates email and password, then returns a JWT token for session management.
 * Token includes user roles and accessible gyms for authorization on other endpoints.
 * 
 * Request body:
 *   - email: {string} User email address
 *   - password: {string} Account password (plain text, hashed in database)
 * 
 * Response (200 OK):
 *   - ok: true
 *   - data:
 *     - token: JWT token (include in Authorization header for protected routes)
 *     - admin: { id, nombre, apellido, email, ... }
 *     - gyms: [ { id, nombre, ... } ] - gyms this user can access
 *     - roles: [ 'DUENO', 'EMPLEADO', 'ADMIN', ... ]
 * 
 * Errors:
 *   - 401: Invalid email or password
 *   - 500: Database error
 * 
 * Usage:
 *   After receiving token, include in subsequent requests:
 *   Authorization: Bearer <token>
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginWithEmail({ email, password });

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}


/**
 * Request a password reset token
 * 
 * Generates a password reset token for an existing user.
 * In production, this token should be sent via email.
 * Currently (dev mode), token is returned in response for testing.
 * 
 * Request body:
 *   - email: {string} User email address
 * 
 * Response (200 OK):
 *   - ok: true
 *   - message: Confirmation message
 *   - token: Reset token (DEV MODE ONLY - should be sent via email in production)
 * 
 * Errors:
 *   - 404: User not found
 *   - 500: Database error
 * 
 * TODO: Implement email service to send token instead of returning in response
 * TODO: Add token expiration (currently no expiry)
 * TODO: Add rate limiting to prevent brute force attacks
 */
export async function passwordResetRequest(req, res, next) {
  try {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      ok: true,
      message: result.mensaje,
      token: result.token // Dev mode: return token. Prod: send via email
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Complete password reset process
 * 
 * Uses a valid reset token to update the user's password.
 * Token must have been previously generated by passwordResetRequest.
 * 
 * Request body:
 *   - token: {string} Password reset token (from passwordResetRequest)
 *   - newPassword: {string} New password (must meet strength requirements)
 * 
 * Response (200 OK):
 *   - ok: true
 *   - message: Confirmation message
 * 
 * Errors:
 *   - 400: Invalid/expired token or weak password
 *   - 404: Token not found
 *   - 500: Database error
 * 
 * Security notes:
 *   - Token is deleted after use (one-time use)
 *   - Should have token expiration (currently unlimited)
 *   - Should verify password meets strength requirements
 */
export async function passwordReset(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword({ token, newPassword });

    res.status(200).json({
      ok: true,
      message: result.mensaje,
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Register an end-user (gym member/client)
 * 
 * Creates a new user account that can enroll in gym memberships.
 * Different from owner/employee registration - for regular app users.
 * 
 * Request body:
 *   - email: {string} User email
 *   - nombre: {string} First name
 *   - apellido: {string} Last name
 *   - password: {string} Password
 * 
 * Response (201 Created):
 *   - ok: true
 *   - data: { user, token, ... }
 * 
 * Errors:
 *   - 400: Invalid data
 *   - 409: Email already registered
 */
export async function registerUserFinal(req, res, next) {
  try {
    const { email, nombre, apellido, password } = req.body;
    const result = await authService.registerUserFinal({ email, nombre, apellido, password });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Login for end-users (gym members)
 * 
 * Authenticates a gym member and returns JWT token.
 * 
 * Request body:
 *   - email: {string} User email
 *   - password: {string} Password
 * 
 * Response (200 OK):
 *   - ok: true
 *   - data: { user, token, gyms, ... }
 * 
 * Errors:
 *   - 401: Invalid credentials
 */
export async function loginUserFinal(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUserFinal({ email, password });
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}


/**
 * Enroll a user in a gym
 * 
 * Links a user to a gym membership with chosen payment method.
 * User must be authenticated and the gym must exist.
 * 
 * Request body:
 *   - gymId: {number} Target gym ID
 *   - metodo_pago: {string} Payment method (tarjeta, efectivo, etc)
 * 
 * Response (200 OK):
 *   - ok: true
 *   - message: Confirmation message
 * 
 * Errors:
 *   - 401: Not authenticated
 *   - 400: Invalid gym or payment method
 */
export async function enrollUserGym(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    
    const userId = req.admin.id; 
    const { gymId, metodo_pago } = req.body;

    const result = await authService.enrollUserInGym({
      userId,
      gymId: Number(gymId),
      metodo_pago
    });
    
    res.status(200).json({ ok: true, message: result.mensaje });
  } catch (err) {
    next(err);
  }
}


/**
 * ============================================================
 * STRIPE PAYMENT CONFIRMATION
 * ============================================================
 * These endpoints complete the registration/branch creation
 * after successful Stripe payment
 */

/**
 * Confirm owner registration after successful payment
 * 
 * Called by frontend after Stripe payment succeeds.
 * Activates the owner account and creates the associated gym.
 * 
 * Workflow:
 *   1. User registers via registerOwner (creates pending account)
 *   2. Frontend sends payment to Stripe
 *   3. Payment succeeds -> confirmOwnerPayment is called
 *   4. Owner account is activated
 * 
 * Request body:
 *   - email: {string} Owner email address
 *   - paymentIntentId: {string} Stripe payment intent ID for verification
 * 
 * Response (200 OK):
 *   - ok: true
 *   - data: { admin, gyms, roles, token }
 * 
 * Errors:
 *   - 400: Email not found or payment intent invalid
 *   - 500: Database error
 * 
 * SECURITY ISSUE: Currently doesn't verify payment status
 * Should check that payment_intent.status == 'succeeded'
 */
export async function confirmOwnerPayment(req, res, next) {
  try {
    const { email, paymentIntentId } = req.body;

    if (!email || !paymentIntentId) {
      throw new AppError("Email and Payment Intent ID required", 400);
    }

    const result = await authService.confirmOwnerRegistrationAfterPayment(
      email,
      paymentIntentId
    );

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}


/**
 * Create a new branch/location after successful payment
 * 
 * Called by authenticated owner after paying for a new branch.
 * Adds a new gym location associated with the owner's account.
 * 
 * Workflow:
 *   1. Owner initiates new branch creation
 *   2. Frontend redirects to Stripe checkout
 *   3. Payment succeeds -> createBranchAfterPayment is called
 *   4. New gym/branch is created and activated
 * 
 * Request body:
 *   - nombre: {string} Branch name
 *   - direccion: {string} Branch street address
 *   - ciudad: {string} Branch city
 *   - urlWeb: {string} Branch website
 *   - paymentIntentId: {string} Stripe payment intent ID
 *   - foto: {file} [optional] Branch photo/logo
 * 
 * Response (201 Created):
 *   - ok: true
 *   - data: { gym, ... }
 * 
 * Errors:
 *   - 401: Not authenticated
 *   - 400: Missing required fields or invalid payment intent
 *   - 500: Database error
 * 
 * Authorization:
 *   - Requires authenticated user (owner)
 *   - Only the authenticated owner can create branches
 */
export async function createBranchAfterPayment(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);

    const { nombre, direccion, ciudad, urlWeb, paymentIntentId } = req.body;
    const foto = req.file?.filename || null;

    const result = await authService.createBranchAfterPayment({
      ownerId: req.admin.id,
      nombre,
      direccion,
      ciudad,
      urlWeb,
      foto,
      paymentIntentId,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}
