import { verifyToken } from '../utils/jwt.js';
import * as authRepository from '../modules/auth/auth.repository.js';

/**
 * Authentication Middleware
 * 
 * Intercepts incoming requests to verify identity context via JWT Bearer tokens.
 * Responsibilities:
 * - Extraction of the Bearer token from the Authorization header.
 * - Validation of the token signature and expiration.
 * - Hydration of the 'req.admin' context with identity and managed gym branch lists.
 * - Termination of the request cycle with 401 (Unauthorized) if validation fails.
 */
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required: Bearer token is missing' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token);

    // Context Hydration: Load all gym branches managed by this administrator
    const gyms = await authRepository.getGymsByAdminId(payload.id);

    // Append security context to the request object
    req.admin = {
      ...payload,
      gyms: gyms.map(g => g.id)
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
}
