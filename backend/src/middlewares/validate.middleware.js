import { ZodError } from "zod";

/**
 * Data Validation Middleware Factory
 * 
 * Generates an Express middleware to enforce structural and type integrity for incoming requests 
 * using Zod schemas. Supports validation for body, query, and path parameters.
 * 
 * @param {Object} schema - Zod schema definition containing '.body', '.query', or '.params'.
 * @returns {Function} Express middleware for schema enforcement.
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      // Validate and sanitize the request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      // Validate and sanitize query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      // Validate and sanitize URL path parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (err) {
      // Handle schema violations with detailed feedback
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Data Validation Failure: The provided payload does not match the required schema.",
          errors: err.errors.map(e => ({ field: e.path.join('.'), issue: e.message })),
        });
      }
      next(err);
    }
  };
}
