/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * 
 * Generates a middleware function that restricts route access based on administrative roles.
 * 
 * @param {...string} rolesPermitidos - Variadic list of roles authorized for the route.
 * @returns {Function} Express middleware that verifies user roles against the whitelist.
 */
export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const roles = req.admin?.roles || [];
    
    // Check if the user possesses at least one of the permitted roles
    const ok = roles.some(r => rolesPermitidos.includes(r));
    
    if (!ok) {
      return res.status(403).json({ 
        message: `Privilege Violation: This action requires one of the following roles: ${rolesPermitidos.join(', ')}` 
      });
    }
    
    next();
  };
}