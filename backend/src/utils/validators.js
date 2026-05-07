/**
 * Required Fields Validation Utility
 * 
 * Enforces mandatory field presence within a data object.
 * Checks for undefined, null, or empty string values.
 * 
 * @param {Object} obj - The payload to validate.
 * @param {Array<string>} fields - List of required property keys.
 * @throws {Error} With status 400 if one or more fields are missing.
 */
export function requireFields(obj, fields) {
  const missing = fields.filter(f => obj[f] === undefined || obj[f] === null || obj[f] === '');
  if (missing.length) {
    const err = new Error(`Integrity Violation: Missing required operational fields: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
}