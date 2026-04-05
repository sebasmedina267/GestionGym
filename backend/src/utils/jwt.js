import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}