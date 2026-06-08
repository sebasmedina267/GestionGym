/**
 * CENTRALIZED LOGGING SYSTEM
 * 
 * Winston logger configuration for consistent logging
 * across the entire application.
 * 
 * Logs to:
 * - Console (development)
 * - File: logs/error.log (errors only)
 * - File: logs/combined.log (all logs)
 * 
 * Usage:
 * import logger from "./utils/logger.js";
 * logger.info("Operation completed", { userId: 123, action: "CREATE" });
 * logger.error("Failed to create user", { error: err.message });
 * 
 * Last updated: 26 de mayo de 2026
 */

import winston from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LOG_LEVELS, LOG_CONTEXT } from "../constants/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "../../logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================================================
// CUSTOM FORMAT
// ============================================================================

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context}]` : "";
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
    return `${timestamp} ${ctx} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// ============================================================================
// TRANSPORTS CONFIGURATION
// ============================================================================

const transports = [
  // Error logs only in error.log
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: LOG_LEVELS.ERROR,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // All logs in combined.log
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    maxsize: 5242880, // 5MB
    maxFiles: 10
  })
];

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? `\x1b[36m[${context}]\x1b[0m` : "";
          const metaStr = Object.keys(meta).length 
            ? "\n" + JSON.stringify(meta, null, 2)
            : "";
          return `\x1b[90m${timestamp}\x1b[0m ${ctx} \x1b[${getLevelColor(level)}m[${level.toUpperCase()}]\x1b[0m: ${message}${metaStr}`;
        })
      )
    })
  );
}

// ============================================================================
// LOGGER INSTANCE
// ============================================================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || LOG_LEVELS.INFO,
  format: customFormat,
  defaultMeta: { 
    service: "gestiongym-api",
    version: "1.0.0"
  },
  transports
});

// ============================================================================
// LOGGER METHODS WITH CONTEXT
// ============================================================================

/**
 * Enhanced logger with context tracking
 */
const enhancedLogger = {
  /**
   * Log info level with context
   * @param {string} context - LOG_CONTEXT value
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(context, message, meta = {}) {
    logger.info(message, { context, ...meta });
  },

  /**
   * Log error level with context
   * @param {string} context - LOG_CONTEXT value
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata (error, stackTrace)
   */
  error(context, message, meta = {}) {
    logger.error(message, { context, ...meta });
  },

  /**
   * Log warn level with context
   * @param {string} context - LOG_CONTEXT value
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(context, message, meta = {}) {
    logger.warn(message, { context, ...meta });
  },

  /**
   * Log debug level with context (development only)
   * @param {string} context - LOG_CONTEXT value
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(context, message, meta = {}) {
    if (process.env.NODE_ENV !== "production") {
      logger.debug(message, { context, ...meta });
    }
  },

  /**
   * Log operation success
   * @param {string} operation - Operation name
   * @param {Object} params - Operation parameters
   */
  logSuccess(operation, params = {}) {
    logger.info(`${operation} completed successfully`, {
      context: LOG_CONTEXT.SYSTEM,
      operation,
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  /**
   * Log operation failure
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   * @param {Object} params - Operation parameters
   */
  logFailure(operation, error, params = {}) {
    logger.error(`${operation} failed`, {
      context: LOG_CONTEXT.SYSTEM,
      operation,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  /**
   * Log authentication event
   */
  logAuth(action, userId, details = {}) {
    logger.info(`Authentication: ${action}`, {
      context: LOG_CONTEXT.AUTH,
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log payment event
   */
  logPayment(action, paymentId, amount, status, details = {}) {
    logger.info(`Payment: ${action}`, {
      context: LOG_CONTEXT.PAYMENT,
      action,
      paymentId,
      amount,
      status,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log client operation
   */
  logClient(action, clientId, gymId, details = {}) {
    logger.info(`Client: ${action}`, {
      context: LOG_CONTEXT.CLIENT,
      action,
      clientId,
      gymId,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Direct access to winston logger
   */
  getWinstonLogger() {
    return logger;
  }
};

// ============================================================================
// HELPER FUNCTION
// ============================================================================

function getLevelColor(level) {
  const colors = {
    error: 31,    // Red
    warn: 33,     // Yellow
    info: 32,     // Green
    debug: 36     // Cyan
  };
  return colors[level] || 37; // Default white
}

export default enhancedLogger;
