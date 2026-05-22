/**
 * Client Authentication Middleware
 * 
 * Validates JWT token for final users (gym clients).
 * Similar to auth.middleware.js but specifically for usuarios_finales.
 * 
 * Usage: Apply to routes that require authenticated client access
 * protected_route.get('/profile', clientAuthMiddleware, controller.getProfile)
 */

import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import * as authRepository from "../modules/auth/auth.repository.js";

/**
 * Middleware: Authenticate client user from JWT token
 * 
 * Extracts token from Authorization header, verifies it,
 * and hydrates req.client with user data.
 * 
 * Expected header: Authorization: Bearer <token>
 * 
 * On success: req.client contains {id, email, nombre, apellido, tipo, ...}
 * On failure: Returns 401 Unauthorized
 */
export async function clientAuthMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid Authorization header", 401);
    }

    const token = authHeader.split(" ")[1];
    
    // Verify JWT signature and expiration
    const decoded = verifyToken(token);
    
    // Verify it's a USUARIO_FINAL token (not admin)
    if (decoded.tipo !== "USUARIO_FINAL") {
      throw new AppError("Invalid token type for client access", 401);
    }

    // Native clients come from the legacy clientes table and carry gymId in the token.
    if (decoded.gymId) {
      const nativeClient = await authRepository.findClienteNativeById(decoded.id);

      if (!nativeClient || !nativeClient.activo) {
        throw new AppError("User account is inactive or does not exist", 401);
      }

      req.client = {
        id: nativeClient.id,
        email: nativeClient.email,
        nombre: nativeClient.nombre,
        apellido: nativeClient.apellido,
        tipo: "USUARIO_FINAL",
        gymId: nativeClient.gym_id,
      };
      req.admin = req.client;

      return next();
    }

    // Fetch fresh user data from database to ensure they still exist and are active
    const user = await authRepository.findUserFinalById(decoded.id);
    
    if (!user || !user.activo) {
      throw new AppError("User account is inactive or does not exist", 401);
    }

    // Update last activity timestamp
    await authRepository.updateUserLastActivity(user.id);

    // Attach user data to request for downstream handlers
    req.client = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      foto: user.foto,
      tipo: "USUARIO_FINAL",
    };
    req.admin = req.client;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(err);
  }
}

/**
 * Middleware: Optional client authentication
 * 
 * Similar to clientAuthMiddleware but doesn't fail if token is missing.
 * Useful for endpoints that work with or without authentication.
 * 
 * Sets req.client if valid token present, leaves it undefined otherwise.
 */
export async function optionalClientAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, just continue
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Skip if not a USUARIO_FINAL token
    if (decoded.tipo !== "USUARIO_FINAL") {
      return next();
    }

    // Fetch user data
    const user = await authRepository.findUserFinalById(decoded.id);
    
    if (user && user.activo) {
      req.client = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        foto: user.foto,
        tipo: "USUARIO_FINAL",
      };
    }

    next();
  } catch (err) {
    // Don't fail on optional auth, just skip
    next();
  }
}
