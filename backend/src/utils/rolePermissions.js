import { AppError } from "./AppError.js";

/**
 * Validar que el usuario tiene al menos uno de los roles permitidos
 * @param {Array} userRoles - Roles del usuario
 * @param {Array} allowedRoles - Roles permitidos
 * @throws {AppError} Si el usuario no tiene permiso
 */
export function requireRole(userRoles, ...allowedRoles) {
  if (!userRoles || userRoles.length === 0) {
    throw new AppError("No tienes un rol asignado", 403);
  }

  const hasRole = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    throw new AppError(
      `No tienes permiso para realizar esta acción. Roles permitidos: ${allowedRoles.join(
        ", "
      )}`,
      403
    );
  }
}

/**
 * Verificar si el usuario es dueño
 */
export function isDueno(userRoles) {
  return userRoles?.includes("DUENO");
}

/**
 * Verificar si el usuario es encargado
 */
export function isEncargado(userRoles) {
  return userRoles?.includes("ENCARGADO");
}

/**
 * Verificar si el usuario es empleado
 */
export function isEmpleado(userRoles) {
  return userRoles?.includes("EMPLEADO");
}

/**
 * Verificar si es dueño o encargado
 */
export function isDuenoOrEncargado(userRoles) {
  return isDueno(userRoles) || isEncargado(userRoles);
}

/**
 * Permisos por módulo y acción
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
    COMPRAR: ["DUENO"], // Reponer stock
    VENDER: ["DUENO", "EMPLEADO", "ENCARGADO"], // Vender productos
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
 * Validar permiso para una acción específica
 */
export function validatePermission(userRoles, module, action) {
  const allowedRoles = permissions[module]?.[action];

  if (!allowedRoles) {
    console.warn(`Permiso no definido para ${module}.${action}`);
    return;
  }

  requireRole(userRoles, ...allowedRoles);
}
