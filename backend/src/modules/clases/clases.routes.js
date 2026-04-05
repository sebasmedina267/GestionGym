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

router.use(authMiddleware, gymMiddleware);

// CLASES - Rutas base (sin parámetros)
router.get("/", clasesController.listarClases);
router.get("/stats/concurrencia", clasesController.clasesConCurrencia);
router.post("/", validate(crearClaseSchema), clasesController.crearClase);

// PRECIOS - Rutas específicas (más específicas primero)
router.patch("/precios/:precioId", validate(actualizarPrecioSchema), clasesController.actualizarPrecio);
router.delete("/precios/:precioId", clasesController.eliminarPrecio);

// HORARIOS - Rutas específicas
router.patch("/horarios/:horarioId", clasesController.actualizarHorario);   
router.delete("/horarios/:horarioId", clasesController.eliminarHorario);
router.get("/horarios/:horarioId/clientes", clasesController.listarClientesDeHorario);
router.post(
  "/horarios/:horarioId/clientes/:clienteId",
  validate(inscribirClienteSchema),
  clasesController.inscribirCliente
);
router.delete(
  "/horarios/:horarioId/clientes/:clienteId",
  validate(inscribirClienteSchema),
  clasesController.desinscribirCliente
);

// SUBRESOURCES - Rutas con :id (más generales, al final)
router.get("/:id/monitores", clasesController.listarMonitores);
router.post("/:id/monitores", validate(agregarMonitorSchema), clasesController.agregarMonitor);
router.delete("/:id/monitores/:monitorId", clasesController.removerMonitor);

router.get("/:id/precios", clasesController.listarPrecios);
router.post("/:id/precios", validate(crearPrecioSchema), clasesController.crearPrecio);

router.get("/:id/horarios", clasesController.listarHorarios);
router.post("/:id/horarios", validate(crearHorarioSchema), clasesController.crearHorario);

router.get("/:id/stats", clasesController.estadisticasClase);

// CLASES - Rutas con parámetro (al final)
router.patch("/:id", validate(actualizarClaseSchema), clasesController.actualizarClase);
router.delete("/:id", clasesController.eliminarClase);

export default router;
