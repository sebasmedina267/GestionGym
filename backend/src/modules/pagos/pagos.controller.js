import * as pagosService from './pagos.service.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   HELPERS
============================================================ */

function validarAdmin(req) {
  if (!req.admin) throw new AppError("No autenticado", 401);
}

function validarId(id, nombre = "ID") {
  const num = Number(id);
  if (isNaN(num)) throw new AppError(`${nombre} inválido`, 400);
  return num;
}

function validarFecha(fecha, nombre) {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) throw new AppError(`Fecha inválida: ${nombre}`, 400);
  return fecha;
}

/* ============================================================
   LISTAR PAGOS
============================================================ */

export async function listarPagos(req, res, next) {
  try {
    validarAdmin(req);

    const filtros = {
      desde: validarFecha(req.query.desde, "desde"),
      hasta: validarFecha(req.query.hasta, "hasta"),
      metodo: req.query.metodo || null
    };

    const pagos = await pagosService.listarPagos(req.gym.id, filtros);

    res.status(200).json({ ok: true, data: pagos });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LISTAR PAGOS PENDIENTES (PARA DASHBOARD)
============================================================ */

export async function listarPagosPendientes(req, res, next) {
  try {
    validarAdmin(req);

    const filtros = {
      desde: validarFecha(req.query.desde, "desde"),
      hasta: validarFecha(req.query.hasta, "hasta"),
    };

    const pagosPendientes = await pagosService.listarPagosPendientes(req.gym.id, filtros);

    res.status(200).json({ ok: true, data: pagosPendientes });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ESTADO PAGOS CLASE
============================================================ */

export async function estadoPagosClase(req, res, next) {
  try {
    validarAdmin(req);
    const claseId = validarId(req.params.claseId, "Clase ID");
    
    // Default a mes actual si no viene en query
    const mes = req.query.mes || new Date().toISOString().substring(0, 7);
    
    const estado = await pagosService.getEstadoPagosClase(req.gym.id, claseId, mes);
    res.status(200).json({ ok: true, data: estado });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   CREAR PAGO
============================================================ */

export async function crearPago(req, res, next) {
  try {
    validarAdmin(req);

    // Dueño y empleado pueden crear pagos
    if (!req.admin.roles.includes("DUENO") && !req.admin.roles.includes("TRABAJADOR")) {
      throw new AppError("No tienes permiso para registrar pagos", 403);
    }

    const pago = await pagosService.crearPago(
      req.gym.id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: pago });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ACTUALIZAR PAGO
============================================================ */

export async function actualizarPago(req, res, next) {
  try {
    validarAdmin(req);

    // Solo dueño puede actualizar pagos
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede actualizar pagos", 403);
    }

    const id = validarId(req.params.id, "Pago ID");

    const pago = await pagosService.actualizarPago(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(200).json({ ok: true, data: pago });
  } catch (err) {
    next(err);
  }
}
