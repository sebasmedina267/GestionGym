import { AppError } from "./AppError.js";

/**
 * Role-Based Access Control (RBAC) Utility
 * 
 * Enforces security policies by verifying that the authenticated user possesses 
 * at least one of the required administrative roles for a given action.
 * 
 * @param {Array} userRoles - The collection of roles assigned to the current user.
 * @param {Array} allowedRoles - Whitelist of roles permitted to perform the action.
 * @throws {AppError} 403 if the user fails the authorization check.
 */
export function requireRole(userRoles, ...allowedRoles) {
  if (!userRoles || userRoles.length === 0) {
    throw new AppError("Authorization Failure: No roles assigned to your identity context", 403);
  }

  const hasRole = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    throw new AppError(
      `Access Denied: You do not have sufficient privileges. Authorized roles: ${allowedRoles.join(
        ", "
      )}`,
      403
    );
  }
}

/** 
 * Verification helper: Checks for 'DUENO' (Owner) status.
 * @param {Array} userRoles - Assigned roles.
 */
export function isDueno(userRoles) {
  return userRoles?.includes("DUENO");
}

/** 
 * Verification helper: Checks for 'ENCARGADO' (Manager) status.
 */
export function isEncargado(userRoles) {
  return userRoles?.includes("ENCARGADO");
}

/** 
 * Verification helper: Checks for 'EMPLEADO' (Staff/Employee) status.
 */
export function isEmpleado(userRoles) {
  return userRoles?.includes("EMPLEADO");
}

/** 
 * Composite helper: Checks for administrative authority (Owner or Manager).
 */
export function isDuenoOrEncargado(userRoles) {
  return isDueno(userRoles) || isEncargado(userRoles);
}

/**
 * Global Permission Registry
 * Defines the authoritative mapping between system modules/actions and required roles.
 * 
 * Roles:
 * - DUENO (Owner): Full platform authority, financial control, and branch creation.
 * - ENCARGADO (Manager): High-level operational management.
 * - EMPLEADO (Staff): Primary interaction layer (check-ins, sales).
 */
export const permissions = {
  CLASES: {
    CREAR: ["DUENO", "ENCARGADO"],
    EDITAR: ["DUENO", "ENCARGADO"],
    ELIMINAR: ["DUENO", "ENCARGADO"],
    CREAR_HORARIO: ["DUENO", "ENCARGADO"],
    ELIMINAR_HORARIO: ["DUENO", "ENCARGADO"],
    ASIGNAR_MONITOR: ["DUENO", "ENCARGADO"],
    INSCRIBIR_CLIENTE: ["DUENO", "EMPLEADO", "ENCARGADO"],
    DESINSCRIBIR_CLIENTE: ["DUENO", "EMPLEADO", "ENCARGADO"],
    MARCAR_PAGADA: ["DUENO", "EMPLEADO", "ENCARGADO"],
  },
  PRODUCTOS: {
    CREAR: ["DUENO"],
    EDITAR: ["DUENO"],
    ELIMINAR: ["DUENO"],
    COMPRAR: ["DUENO"], // Replenish inventory stock
    VENDER: ["DUENO", "EMPLEADO", "ENCARGADO"], // Point of sale transactions
  },
  MAQUINAS: {
    CREAR: ["DUENO"],
    EDITAR: ["DUENO"],
    ELIMINAR: ["DUENO"],
    VER: ["DUENO", "EMPLEADO", "ENCARGADO"],
  },
  ADMINISTRACION: {
    CREAR_GYM: ["DUENO"],
    EDITAR_GYM: ["DUENO"],
    CREAR_EMPLEADO: ["DUENO"],
    EDITAR_EMPLEADO: ["DUENO"],
    ELIMINAR_EMPLEADO: ["DUENO"],
    VER_EMPLEADOS: ["DUENO", "ENCARGADO"],
  },
  ECONOMIA: {
    VER: ["DUENO"],
    EXPORTAR: ["DUENO"],
  },
};

/**
 * Validates granular permission for a specific module and action.
 * Maps the request to the central permission registry and enforces a role check.
 * 
 * @param {Array} userRoles - The actor's roles.
 * @param {string} module - The target system module (e.g., 'ECONOMIA').
 * @param {string} action - The intended action (e.g., 'VER').
 */
export function validatePermission(userRoles, module, action) {
  const allowedRoles = permissions[module]?.[action];

  if (!allowedRoles) {
    console.warn(`System Warning: Undefined permission mapping for ${module}.${action}`);
    return;
  }

  requireRole(userRoles, ...allowedRoles);
}
