import bcrypt from 'bcrypt';

/**
 * Security Constants
 * Defines the computational cost factor for password hashing.
 */
const SALT_ROUNDS = 10;

/**
 * Password Hashing Service
 * 
 * Transforms a plain-text password into a secure cryptographic hash using bcrypt.
 * 
 * @param {string} plain - The raw password string.
 * @returns {Promise<string>} The generated salt-and-hash string.
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Password Verification Service
 * 
 * Securely compares a plain-text password against a stored cryptographic hash.
 * 
 * @param {string} plain - The raw password provided during login.
 * @param {string} hash - The persisted hash to verify against.
 * @returns {Promise<boolean>} True if the credentials match, false otherwise.
 */
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}