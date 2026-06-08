/**
 * AUTHENTICATION & AUTHORIZATION UTILITIES
 * 
 * Centralized validation functions to eliminate code duplication
 * across controllers and services.
 * 
 * DRY Principle: Single source of truth for auth checks
 * Last updated: 26 de mayo de 2026
 */

import { AppError } from "./AppError.js";
import { BUSINESS_RULES, ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

// ============================================================================
// ADMIN AUTHENTICATION CHECKS
// ============================================================================

/**
 * Validates that an admin is properly authenticated
 * 
 * @param {Object} req - Express request object
 * @param {Object} admin - Admin object from request
 * @throws {AppError} If admin is not authenticated
 * 
 * @example
 * validateAdminAuthenticated(req);
 */
export function validateAdminAuthenticated(req) {
  if (!req.admin || !req.admin.id) {
    throw new AppError(
      ERROR_MESSAGES.AUTH_REQUIRED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }
}

/**
 * Validates that a request contains admin object
 * Can be used as middleware or function
 * 
 * @param {Object} req - Express request object
 * @throws {AppError} If admin is missing
 */
export function requireAdmin(req, res, next) {
  try {
    validateAdminAuthenticated(req);
    next();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// GYM ACCESS VALIDATION
// ============================================================================

/**
 * Validates that an admin has access to a specific gym
 * 
 * @param {number} adminId - ID of admin
 * @param {number} gymId - ID of gym to validate access
 * @param {Object} authRepository - Auth repository instance
 * @throws {AppError} If admin doesn't have access to gym
 * 
 * @example
 * await validateGymAccess(req.admin.id, req.body.gymId, authRepository);
 */
export async function validateGymAccess(adminId, gymId, authRepository) {
  if (!adminId || !gymId) {
    throw new AppError(
      ERROR_MESSAGES.MISSING_FIELDS,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const gyms = await authRepository.getGymsByAdminId(adminId);

  if (!gyms || gyms.length === 0) {
    throw new AppError(
      ERROR_MESSAGES.GYM_NOT_FOUND,
      HTTP_STATUS.FORBIDDEN
    );
  }

  const hasAccess = gyms.some(g => g.id === parseInt(gymId));
  
  if (!hasAccess) {
    throw new AppError(
      ERROR_MESSAGES.ACCESS_DENIED,
      HTTP_STATUS.FORBIDDEN
    );
  }
}

/**
 * Middleware version of validateGymAccess
 * Expects gymId in req.body or req.params
 * 
 * @param {Object} authRepository - Auth repository instance
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post("/clients", requireGymAccess(authRepository), createClient);
 */
export function requireGymAccess(authRepository) {
  return async (req, res, next) => {
    try {
      const gymId = req.body.gymId || req.params.gymId;
      await validateGymAccess(req.admin.id, gymId, authRepository);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// ============================================================================
// ID VALIDATION
// ============================================================================

/**
 * Validates that a value is a valid numeric ID
 * 
 * @param {any} id - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {number} Validated numeric ID
 * @throws {AppError} If ID is invalid
 * 
 * @example
 * const clientId = validateNumericId(req.params.id, "Client ID");
 */
export function validateNumericId(id, fieldName = "ID") {
  const numId = Number(id);
  
  if (isNaN(numId) || numId <= 0) {
    throw new AppError(
      `${ERROR_MESSAGES.INVALID_ID}: ${fieldName}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  return numId;
}

/**
 * Validates multiple IDs at once
 * 
 * @param {Object} ids - Object with id properties
 * @param {Array<string>} fieldNames - Names of fields to validate
 * @returns {Object} Object with validated IDs
 * @throws {AppError} If any ID is invalid
 * 
 * @example
 * const { gymId, clientId } = validateNumericIds(
 *   { gymId: req.params.gymId, clientId: req.params.clientId },
 *   ["gymId", "clientId"]
 * );
 */
export function validateNumericIds(ids, fieldNames) {
  const validated = {};
  
  for (const fieldName of fieldNames) {
    if (!(fieldName in ids)) {
      throw new AppError(
        `Missing required field: ${fieldName}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    validated[fieldName] = validateNumericId(ids[fieldName], fieldName);
  }
  
  return validated;
}

// ============================================================================
// ROLE & PERMISSION VALIDATION
// ============================================================================

/**
 * Validates that admin has required role
 * 
 * @param {Object} admin - Admin object
 * @param {string|Array} requiredRoles - Role(s) required
 * @throws {AppError} If admin doesn't have required role
 * 
 * @example
 * validateRole(req.admin, "DUENO");
 * validateRole(req.admin, ["DUENO", "GERENTE"]);
 */
export function validateRole(admin, requiredRoles) {
  if (!admin || !admin.roles) {
    throw new AppError(
      ERROR_MESSAGES.AUTH_REQUIRED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const hasRole = roles.some(role => admin.roles.includes(role));

  if (!hasRole) {
    throw new AppError(
      ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      HTTP_STATUS.FORBIDDEN
    );
  }
}

/**
 * Middleware factory for role validation
 * 
 * @param {string|Array} requiredRoles - Role(s) required
 * @returns {Function} Express middleware
 * 
 * @example
 * router.delete("/clients/:id", requireRole("DUENO"), deleteClient);
 */
export function requireRole(requiredRoles) {
  return (req, res, next) => {
    try {
      validateRole(req.admin, requiredRoles);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// ============================================================================
// PAYMENT VALIDATION
// ============================================================================

/**
 * Validates that a payment has been completed successfully
 * 
 * @param {Object} payment - Payment object
 * @throws {AppError} If payment is not completed
 * 
 * @example
 * validatePaymentCompleted(paymentRecord);
 */
export function validatePaymentCompleted(payment) {
  if (!payment) {
    throw new AppError(
      ERROR_MESSAGES.PAYMENT_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND
    );
  }

  if (payment.status !== BUSINESS_RULES.PAYMENT.STATUS_COMPLETED) {
    throw new AppError(
      ERROR_MESSAGES.PAYMENT_VERIFICATION_FAILED,
      HTTP_STATUS.BAD_REQUEST
    );
  }
}

// ============================================================================
// ENTITY EXISTENCE CHECKS
// ============================================================================

/**
 * Validates that an entity exists
 * 
 * @param {Object} entity - Entity to check
 * @param {string} entityName - Name of entity for error message
 * @throws {AppError} If entity doesn't exist
 * 
 * @example
 * validateEntityExists(client, "Cliente");
 */
export function validateEntityExists(entity, entityName = "Registro") {
  if (!entity) {
    throw new AppError(
      `${entityName} no encontrado`,
      HTTP_STATUS.NOT_FOUND
    );
  }
}

// ============================================================================
// COMBINED VALIDATION HELPERS
// ============================================================================

/**
 * Complete validation for accessing a resource
 * Checks authentication + gym access + resource exists
 * 
 * @param {Object} req - Express request object
 * @param {number} gymId - Gym ID to validate
 * @param {Object} resource - Resource to check existence
 * @param {Object} authRepository - Auth repository instance
 * @param {string} resourceName - Name for error messages
 * @throws {AppError} If any validation fails
 * 
 * @example
 * validateResourceAccess(
 *   req,
 *   req.params.gymId,
 *   client,
 *   authRepository,
 *   "Cliente"
 * );
 */
export async function validateResourceAccess(
  req,
  gymId,
  resource,
  authRepository,
  resourceName = "Recurso"
) {
  validateAdminAuthenticated(req);
  await validateGymAccess(req.admin.id, gymId, authRepository);
  validateEntityExists(resource, resourceName);
}
