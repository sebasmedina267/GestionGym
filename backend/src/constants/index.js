/**
 * CENTRALIZED CONSTANTS
 * 
 * Single source of truth for all business rules, configurations,
 * and magic numbers across the application.
 * 
 * Last updated: 26 de mayo de 2026
 */

// ============================================================================
// BUSINESS RULES
// ============================================================================

export const BUSINESS_RULES = {
  INACTIVITY: {
    MONTHS_THRESHOLD: 4,
    DESCRIPTION: "Clientes sin actividad durante 4+ meses serán eliminados automáticamente"
  },
  
  LOCATION: {
    SEARCH_RADIUS_KM: 5,
    MIN_LATITUDE: -90,
    MAX_LATITUDE: 90,
    MIN_LONGITUDE: -180,
    MAX_LONGITUDE: 180
  },
  
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    // RFC5322 simplified regex for password validation
    REGEX: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/
  },
  
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100
  },
  
  PAYMENT: {
    STATUS_PENDING: "pending",
    STATUS_COMPLETED: "completed",
    STATUS_FAILED: "failed",
    VERIFICATION_REQUIRED: true
  }
};

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: "Autenticación requerida",
  INVALID_CREDENTIALS: "Credenciales inválidas",
  TOKEN_EXPIRED: "Token expirado",
  
  // Authorization
  ACCESS_DENIED: "Acceso denegado a este gimnasio",
  INSUFFICIENT_PERMISSIONS: "Permisos insuficientes para esta operación",
  GYM_NOT_FOUND: "Gimnasio no encontrado o no tienes acceso",
  
  // Validation
  INVALID_PASSWORD: "Contraseña no cumple requisitos (mín 8 caracteres, 1 mayúscula, 1 número, 1 símbolo)",
  INVALID_EMAIL: "Email inválido",
  INVALID_ID: "ID inválido o no es número",
  MISSING_FIELDS: "Campos requeridos faltantes",
  
  // Duplicates
  DUPLICATE_EMAIL: "El email ya está registrado",
  DUPLICATE_ENTRY: "Registro duplicado",
  
  // Not Found
  CLIENT_NOT_FOUND: "Cliente no encontrado",
  EMPLOYEE_NOT_FOUND: "Empleado no encontrado",
  CLASS_NOT_FOUND: "Clase no encontrada",
  PAYMENT_NOT_FOUND: "Pago no encontrado",
  
  // Business Logic
  PAYMENT_VERIFICATION_FAILED: "Verificación de pago fallida",
  PAYMENT_REQUIRED: "Pago requerido para completar esta acción",
  INSUFFICIENT_BALANCE: "Saldo insuficiente",
  
  // System
  SYSTEM_ERROR: "Error del sistema. Por favor intenta más tarde",
  DATABASE_ERROR: "Error de base de datos",
  INVALID_OPERATION: "Operación no permitida"
};

// ============================================================================
// USER ROLES
// ============================================================================

export const USER_ROLES = {
  OWNER: "DUENO",
  MANAGER: "GERENTE",
  TRAINER: "ENTRENADOR",
  RECEPTIONIST: "RECEPCIONISTA",
  CLIENT: "CLIENTE"
};

// ============================================================================
// PERMISSIONS BY ROLE
// ============================================================================

export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: [
    "view_gym",
    "manage_gym",
    "manage_employees",
    "manage_clients",
    "view_payments",
    "manage_payments",
    "view_reports",
    "manage_settings"
  ],
  
  [USER_ROLES.MANAGER]: [
    "view_gym",
    "manage_clients",
    "view_payments",
    "view_reports",
    "manage_classes"
  ],
  
  [USER_ROLES.TRAINER]: [
    "view_gym",
    "view_clients",
    "manage_classes"
  ],
  
  [USER_ROLES.RECEPTIONIST]: [
    "view_gym",
    "view_clients",
    "manage_check_in"
  ],
  
  [USER_ROLES.CLIENT]: [
    "view_own_profile",
    "enroll_classes",
    "view_own_payments"
  ]
};

// ============================================================================
// LOGGING LEVELS
// ============================================================================

export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
  TRACE: "trace"
};

// ============================================================================
// LOG CONTEXT TYPES
// ============================================================================

export const LOG_CONTEXT = {
  AUTH: "AUTH",
  CLIENT: "CLIENT",
  PAYMENT: "PAYMENT",
  GYM: "GYM",
  EMPLOYEE: "EMPLOYEE",
  CLASS: "CLASS",
  REPORT: "REPORT",
  SYSTEM: "SYSTEM"
};

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  ISO: "YYYY-MM-DD",
  TIME: "HH:mm:ss",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  DISPLAY: "DD/MM/YYYY",
  DISPLAY_TIME: "DD/MM/YYYY HH:mm"
};

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{7,15}$/,
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  LATITUDE: /^[-]?([0-8]?[0-9](\.\d+)?|90(\.0+)?)$/,
  LONGITUDE: /^[-]?(180(\.0+)?|((1[0-7][0-9]|[1-9]?[0-9])(\.\d+)?))$/
};
