import * as clasesService from "./clases.service.js";
import { AppError } from "../../utils/AppError.js";
import { validatePermission } from "../../utils/rolePermissions.js";

/**
 * Class Listing Handler
 * Retrieves all defined classes for the current gym branch.
 */
export async function listarClases(req, res, next) {
  try {
    const gymId = req.gym.id;
    const clases = await clasesService.listarClases(gymId);
    res.status(200).json({ ok: true, data: clases });
  } catch (err) {
    next(err);
  }
}

/**
 * Class Creation Handler
 * Creates a new base class definition. Requires explicit permission.
 */
export async function crearClase(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    // RBAC: Verify if the user has creation rights for the 'CLASES' module
    validatePermission(req.admin.roles, "CLASES", "CREAR");
    
    const gymId = req.gym.id;
    const clase = await clasesService.crearClase(gymId, req.body, req.admin);
    res.status(201).json({ ok: true, data: clase });
  } catch (err) {
    next(err);
  }
}

/**
 * Class Update Handler
 * Modifies an existing class definition. Requires update permissions.
 */
export async function actualizarClase(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    validatePermission(req.admin.roles, "CLASES", "EDITAR");
    
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const clase = await clasesService.actualizarClase(gymId, claseId, req.body, req.admin);
    res.status(200).json({ ok: true, data: clase });
  } catch (err) {
    next(err);
  }
}

/**
 * Class Deletion Handler
 * Permanently removes a class and its dependencies.
 */
export async function eliminarClase(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    validatePermission(req.admin.roles, "CLASES", "ELIMINAR");
    
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    await clasesService.eliminarClase(gymId, claseId, req.admin);
    res.status(200).json({ ok: true, message: "Class deleted successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * Schedule Listing Handler
 * Retrieves all scheduled sessions for a specific class.
 */
export async function listarHorarios(req, res, next) {
  try {
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const horarios = await clasesService.listarHorarios(gymId, claseId);
    res.status(200).json({ ok: true, data: horarios });
  } catch (err) {
    next(err);
  }
}

/**
 * Schedule Creation Handler
 * Adds a new recurring or one-time session to a class.
 */
export async function crearHorario(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    validatePermission(req.admin.roles, "CLASES", "CREAR_HORARIO");
    
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const horario = await clasesService.crearHorario(gymId, claseId, req.body, req.admin);
    res.status(201).json({ ok: true, data: horario });
  } catch (err) {
    next(err);
  }
}

/**
 * Schedule Deletion Handler
 * Removes a session from the weekly schedule.
 */
export async function eliminarHorario(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    validatePermission(req.admin.roles, "CLASES", "ELIMINAR_HORARIO");
    
    const gymId = req.gym.id;
    const horarioId = Number(req.params.horarioId);
    await clasesService.eliminarHorario(gymId, horarioId, req.admin);
    res.status(200).json({ ok: true, message: "Session deleted from schedule" });
  } catch (err) {
    next(err);
  }
}

/**
 * Enrollment List Handler
 * Retrieves all clients currently enrolled in a specific class session.
 */
export async function listarClientesDeHorario(req, res, next) {
  try {
    const gymId = req.gym.id;
    const horarioId = Number(req.params.horarioId);
    const clientes = await clasesService.getClientesDeHorario(gymId, horarioId);
    res.status(200).json({ ok: true, data: clientes });
  } catch (err) {
    next(err);
  }
}

/**
 * Enrollment Handler
 * Registers a client for a specific class session.
 */
export async function inscribirCliente(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    validatePermission(req.admin.roles, "CLASES", "INSCRIBIR_CLIENTE");
    
    const gymId = req.gym.id;
    const horarioId = Number(req.params.horarioId);
    const clienteId = Number(req.params.clienteId);
    const inscripcion = await clasesService.inscribirClienteEnHorario(
      gymId,
      horarioId,
      clienteId,
      req.admin
    );
    res.status(201).json({ ok: true, data: inscripcion });
  } catch (err) {
    next(err);
  }
}

/**
 * Unenrollment Handler
 * Removes a client from a specific class session.
 */
export async function desinscribirCliente(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    validatePermission(req.admin.roles, "CLASES", "DESINSCRIBIR_CLIENTE");
    
    const gymId = req.gym.id;
    const horarioId = Number(req.params.horarioId);
    const clienteId = Number(req.params.clienteId);
    await clasesService.desinscribirClienteDeHorario(
      gymId,
      horarioId,
      clienteId,
      req.admin
    );
    res.status(200).json({ ok: true, message: "Client unenrolled successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * Class Statistics Handler
 * Provides attendance and performance metrics for a specific class type.
 */
export async function estadisticasClase(req, res, next) {
  try {
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const stats = await clasesService.estadisticasClase(gymId, claseId);
    res.status(200).json({ ok: true, data: stats });
  } catch (err) {
    next(err);
  }
}

/**
 * Global Concurrency Handler
 * Lists all classes with their respective popularity and occupancy levels.
 */
export async function clasesConCurrencia(req, res, next) {
  try {
    const gymId = req.gym.id;
    const clases = await clasesService.obtenerClasesConCurrencia(gymId);
    res.status(200).json({ ok: true, data: clases });
  } catch (err) {
    next(err);
  }
}

/**
 * Schedule Update Handler
 * Modifies parameters (time, day, limit) of a scheduled session.
 */
export async function actualizarHorario(req, res, next) {
  try {
    const { horarioId } = req.params;
    const data = req.body;
    const admin = req.admin; // Corrected from req.user
    const gymId = req.gym.id;

    const horario = await clasesService.actualizarHorario(
      gymId,
      Number(horarioId),
      data,
      admin
    );

    res.json({ ok: true, data: horario });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   INSTRUCTOR (MONITOR) MANAGEMENT
   ============================================================ */

/** Lists instructors assigned to a class */
export async function listarMonitores(req, res, next) {
  try {
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const monitores = await clasesService.listarMonitores(gymId, claseId);
    res.status(200).json({ ok: true, data: monitores });
  } catch (err) {
    next(err);
  }
}

/** Assigns a new instructor to a class */
export async function agregarMonitor(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const { admin_id } = req.body;
    
    await clasesService.agregarMonitor(gymId, claseId, admin_id, req.admin);
    res.status(201).json({ ok: true, message: "Instructor assigned" });
  } catch (err) {
    next(err);
  }
}

/** Removes an instructor assignment from a class */
export async function removerMonitor(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const monitorId = Number(req.params.monitorId);
    
    await clasesService.removerMonitor(gymId, claseId, monitorId, req.admin);
    res.status(200).json({ ok: true, message: "Instructor removed" });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PRICING TIER MANAGEMENT
   ============================================================ */

/** Lists pricing options for a class */
export async function listarPrecios(req, res, next) {
  try {
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const precios = await clasesService.listarPrecios(gymId, claseId);
    res.status(200).json({ ok: true, data: precios });
  } catch (err) {
    next(err);
  }
}

/** Creates a new pricing tier for a class */
export async function crearPrecio(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const precio = await clasesService.crearPrecio(gymId, claseId, req.body, req.admin);
    res.status(201).json({ ok: true, data: precio });
  } catch (err) {
    next(err);
  }
}

/** Updates an existing pricing tier */
export async function actualizarPrecio(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    const precioId = Number(req.params.precioId);
    const precio = await clasesService.actualizarPrecio(precioId, req.body, req.admin);
    res.status(200).json({ ok: true, data: precio });
  } catch (err) {
    next(err);
  }
}

/** Deletes a pricing tier */
export async function eliminarPrecio(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);
    const precioId = Number(req.params.precioId);
    await clasesService.eliminarPrecio(precioId, req.admin);
    res.status(200).json({ ok: true, message: "Pricing tier removed" });
  } catch (err) {
    next(err);
  }
}
