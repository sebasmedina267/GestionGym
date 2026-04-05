import * as economiaService from "./economia.service.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   HELPERS
============================================================ */

function validarAdmin(req) {
  if (!req.admin) throw new AppError("No autenticado", 401);
}

function validarFecha(fecha, nombre) {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) throw new AppError(`Fecha inválida: ${nombre}`, 400);
  return fecha;
}

/* ============================================================
   RESUMEN ECONÓMICO
============================================================ */

export async function resumenEconomico(req, res, next) {
  try {
    validarAdmin(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    const resumen = await economiaService.resumenEconomico(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: resumen });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   INGRESOS MANUALES
============================================================ */

export async function crearIngresoManual(req, res, next) {
  try {
    validarAdmin(req);

    // Dueño y empleado pueden crear ingresos
    if (
      !req.admin.roles.includes("DUENO") &&
      !req.admin.roles.includes("TRABAJADOR")
    ) {
      throw new AppError("No tienes permiso para registrar ingresos", 403);
    }

    const ingreso = await economiaService.crearIngresoManual(
      req.gym.id,
      req.body,
      req.admin,
    );

    res.status(201).json({ ok: true, data: ingreso });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   GASTOS MANUALES
============================================================ */

export async function crearGastoManual(req, res, next) {
  try {
    validarAdmin(req);

    // Solo dueño puede registrar gastos
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede registrar gastos", 403);
    }

    const gasto = await economiaService.crearGastoManual(
      req.gym.id,
      req.body,
      req.admin,
    );

    res.status(201).json({ ok: true, data: gasto });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LISTAR INGRESOS
============================================================ */

export async function listarIngresos(req, res, next) {
  try {
    validarAdmin(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    const ingresos = await economiaService.listarIngresos(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: ingresos });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LISTAR GASTOS
============================================================ */

export async function listarGastos(req, res, next) {
  try {
    validarAdmin(req);

    const desde = validarFecha(req.query.desde, "desde");
    const hasta = validarFecha(req.query.hasta, "hasta");

    const gastos = await economiaService.listarGastos(req.gym.id, {
      desde,
      hasta,
    });

    res.status(200).json({ ok: true, data: gastos });
  } catch (err) {
    next(err);
  }
}
