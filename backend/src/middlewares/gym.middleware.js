/**
 * Gym Context Middleware
 * 
 * Enforces the selection of a specific operational branch for administrative actions.
 * Responsibilities:
 * - Extraction of the active branch ID from the 'x-gym-id' custom header.
 * - Validation that the authenticated administrator has jurisdictional rights over the branch.
 * - Provisioning of the 'req.gym' context for downstream controllers and services.
 * - Rejection of unauthorized cross-branch data access attempts.
 */
export function gymMiddleware(req, res, next) {
  const gymId = Number(req.headers['x-gym-id']);

  if (!gymId) {
    return res.status(400).json({ message: 'Operational context error: A gym branch must be selected' });
  }

  // Security Guard: Verify the administrator is linked to the requested branch
  if (!req.admin?.gyms?.includes(gymId)) {
    return res.status(403).json({ message: 'Access Denied: You do not have management rights for this branch' });
  }

  req.gym = { id: gymId };
  next();
}