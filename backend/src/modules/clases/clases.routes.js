import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { gymMiddleware } from "../../middlewares/gym.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import * as clasesController from "./clases.controller.js";
import {
  crearClaseSchema,
  actualizarClaseSchema,
  crearHorarioSchema,
  inscribirClienteSchema,
  crearPrecioSchema,
  actualizarPrecioSchema,
  agregarMonitorSchema
} from "../../schemas/clases.schemas.js";

const router = Router();

/**
 * Class Management Routes
 * 
 * Orchestrates all operations related to gym classes, including:
 * - Basic class definitions
 * - Pricing tiers
 * - Weekly schedules
 * - Instructor assignments
 * - Member enrollment/check-in
 * 
 * Requires active authentication and a specific gym branch context.
 */

// Global protection: all routes require a valid session and a selected gym
router.use(authMiddleware, gymMiddleware);

// --- Core Class Definition Routes ---

/** List all classes available in the current gym branch */
router.get("/", clasesController.listarClases);

/** Analytics: High-level overview of class attendance and popularity */
router.get("/stats/concurrencia", clasesController.clasesConCurrencia);

/** Register a new base class definition (e.g., 'CrossFit', 'Yoga') */
router.post("/", validate(crearClaseSchema), clasesController.crearClase);

// --- Pricing Tier Management ---

/** Update an existing pricing tier */
router.patch("/precios/:precioId", validate(actualizarPrecioSchema), clasesController.actualizarPrecio);

/** Permanently remove a pricing tier */
router.delete("/precios/:precioId", clasesController.eliminarPrecio);

// --- Weekly Schedule & Enrollment Management ---

/** Update specific session details for a class schedule */
router.patch("/horarios/:horarioId", clasesController.actualizarHorario);

/** Cancel/Delete a specific class session from the schedule */
router.delete("/horarios/:horarioId", clasesController.eliminarHorario);

/** List all members currently enrolled/checked-in for a specific session */
router.get("/horarios/:horarioId/clientes", clasesController.listarClientesDeHorario);

/** Enroll/Check-in a client into a specific class session */
router.post(
  "/horarios/:horarioId/clientes/:clienteId",
  validate(inscribirClienteSchema),
  clasesController.inscribirCliente
);

/** Remove/Unenroll a client from a specific class session */
router.delete(
  "/horarios/:horarioId/clientes/:clienteId",
  validate(inscribirClienteSchema),
  clasesController.desinscribirCliente
);

// --- Subresource Management (Instructors, Prices, Schedules) ---

/** List instructors assigned to a specific class type */
router.get("/:id/monitores", clasesController.listarMonitores);

/** Assign a new instructor/monitor to a class type */
router.post("/:id/monitores", validate(agregarMonitorSchema), clasesController.agregarMonitor);

/** Remove an instructor's assignment from a class type */
router.delete("/:id/monitores/:monitorId", clasesController.removerMonitor);

/** List all pricing tiers associated with a class type */
router.get("/:id/precios", clasesController.listarPrecios);

/** Define a new pricing tier for a specific class */
router.post("/:id/precios", validate(crearPrecioSchema), clasesController.crearPrecio);

/** List all scheduled sessions for a class type */
router.get("/:id/horarios", clasesController.listarHorarios);

/** Add a new weekly recurring session for a class */
router.post("/:id/horarios", validate(crearHorarioSchema), clasesController.crearHorario);

/** Detailed analytics and attendance breakdown for a specific class */
router.get("/:id/stats", clasesController.estadisticasClase);

// --- Class Life Cycle Management ---

/** Update the core definition of a class (Name, description, etc.) */
router.patch("/:id", validate(actualizarClaseSchema), clasesController.actualizarClase);

/** Archive/Delete a class definition and all its associated data */
router.delete("/:id", clasesController.eliminarClase);

export default router;
