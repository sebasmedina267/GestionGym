import { registrarOperacion } from '../modules/audit/audit.service.js';

/**
 * Middleware de auditoría automática avanzada.
 * Detecta:
 *  - admin
 *  - gym
 *  - método HTTP
 *  - entidad (por ruta)
 *  - entidadId (por params)
 *  - detalles (body + query + path)
 */
export async function auditMiddleware(req, res, next) {
  const admin = req.admin;
  const gym = req.gym;

  // Si no hay admin o gym, no auditamos
  if (!admin || !gym) return next();

  // Detectar acción por método HTTP
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

  // Detectar entidad por la ruta
  // Ej: /api/gym/1/productos/5 → entidad = PRODUCTOS
  const path = req.originalUrl;
  const match = path.match(/\/(clientes|productos|clases|maquinas|pagos|gastos|ingresos|economia|admins|gyms)(\/|$)/);

  const entidad = match ? match[1].toUpperCase() : null;

  // Detectar ID si existe
  const entidadId =
    req.params.id ||
    req.params.clienteId ||
    req.params.productoId ||
    req.params.claseId ||
    req.params.horarioId ||
    req.params.maquinaId ||
    null;

  // Guardar auditoría sin bloquear la request
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
    // Nunca romper la request por un fallo de auditoría
    console.error("Error en auditoría automática:", err);
  }

  next();
}
