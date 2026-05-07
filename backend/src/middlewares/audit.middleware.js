import { registrarOperacion } from '../modules/audit/audit.service.js';

/**
 * Advanced Automated Audit Middleware
 * 
 * Intercepts active request cycles to transparently capture operational telemetry.
 * Automatically identifies:
 * - The Actor: Authenticated administrator ID.
 * - The Context: Selected gym branch ID.
 * - The Action: Derived from HTTP methods (POST -> CREATE, etc.).
 * - The Resource: Extracted via path-to-entity mapping (REGEX).
 * - The Specific Record: Extracted from common path parameters (IDs).
 * - The Metadata: Comprehensive snapshot of request body and query parameters.
 * 
 * Safety Policy: Audit failures are captured and logged to console but NEVER 
 * disrupt the primary request flow.
 */
export async function auditMiddleware(req, res, next) {
  const admin = req.admin;
  const gym = req.gym;

  // Termination: Do not audit if identity or branch context is missing
  if (!admin || !gym) return next();

  // Action Mapping: Translate HTTP semantics into domain-specific actions
  const method = req.method;
  let accion = null;

  switch (method) {
    case "POST": accion = "CREAR"; break;
    case "PUT":
    case "PATCH": accion = "ACTUALIZAR"; break;
    case "DELETE": accion = "ELIMINAR"; break;
    case "GET": accion = "CONSULTAR"; break;
    default: accion = `REQUEST_${method}`;
  }

  // Resource Discovery: Map URL path patterns to system entities (e.g., /api/clientes -> CLIENTES)
  const path = req.originalUrl;
  const match = path.match(/\/(clientes|productos|clases|maquinas|pagos|gastos|ingresos|economia|admins|gyms)(\/|$)/);

  const entidad = match ? match[1].toUpperCase() : null;

  // Record Identification: Scan path parameters for unique identifiers
  const entidadId =
    req.params.id ||
    req.params.clienteId ||
    req.params.productoId ||
    req.params.claseId ||
    req.params.horarioId ||
    req.params.maquinaId ||
    null;

  // Persistence: Trigger the non-blocking audit logging service
  try {
    await registrarOperacion({
      adminId: admin.id,
      gymId: gym.id,
      entidad,
      entidadId: entidadId || null,
      accion,
      detalles: {
        path,
        body: req.body,
        query: req.query
      }
    });
  } catch (err) {
    // Fail-Safe: Log error to console but permit request to continue
    console.error("Non-Critical Failure: Automated audit telemetry failed:", err);
  }

  next();
}
