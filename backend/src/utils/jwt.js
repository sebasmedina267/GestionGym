import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Identity Tokenization Service
 * 
 * Generates a signed JSON Web Token (JWT) for user authentication.
 * 
 * @param {Object} payload - User identity data (ID, roles, etc.).
 * @returns {string} Signed JWT with an 8-hour expiration.
 */
export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });
}

/**
 * Identity Verification Service
 * 
 * Validates the signature and expiration of a JWT against the system secret.
 * 
 * @param {string} token - The Bearer token provided by the client.
 * @returns {Object} The decoded payload if verification is successful.
 * @throws {Error} If the token is malformed, expired, or tampered with.
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}