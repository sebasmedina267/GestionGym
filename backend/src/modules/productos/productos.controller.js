import * as productosService from './productos.service.js';
import { AppError } from '../../utils/AppError.js';
import { validatePermission } from '../../utils/rolePermissions.js';

/* ============================================================
   HELPERS
============================================================ */

/**
 * Ensures the request is authenticated via an administrator context.
 * @param {Object} req - Express request object.
 * @throws {AppError} 401 if unauthorized.
 */
function validarAdmin(req) {
  if (!req.admin) throw new AppError("Authentication required: Identity context is missing", 401);
}

/**
 * Validates a numeric identifier.
 */
function validarId(id, nombre = "ID") {
  const num = Number(id);
  if (isNaN(num)) throw new AppError(`Invalid format for field: ${nombre}`, 400);
  return num;
}

/**
 * Validates a date string and returns the original if correct.
 */
function validarFecha(fecha, nombre) {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) throw new AppError(`Invalid date provided: ${nombre}`, 400);
  return fecha;
}

/* ============================================================
   PRODUCT CATALOG HANDLERS
============================================================ */

/**
 * Retrieves the full product catalog for the current branch.
 */
export async function listarProductos(req, res, next) {
  try {
    validarAdmin(req);

    const productos = await productosService.listarProductos(req.gym.id);

    res.status(200).json({ ok: true, data: productos });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves historical inventory movements (Purchases/Sales).
 * Supports temporal filtering and movement type classification.
 */
export async function listarMovimientos(req, res, next) {
  try {
    validarAdmin(req);

    const filtros = {
      desde: validarFecha(req.query.desde, "desde"),
      hasta: validarFecha(req.query.hasta, "hasta"),
      tipo: req.query.tipo || null
    };

    const movimientos = await productosService.listarMovimientos(
      req.gym.id,
      filtros
    );

    res.status(200).json({ ok: true, data: movimientos });
  } catch (err) {
    next(err);
  }
}

/**
 * Provides analytics for product performance and inventory health.
 */
export async function estadisticasProductos(req, res, next) {
  try {
    validarAdmin(req);

    const stats = await productosService.estadisticasProductos(req.gym.id);

    res.status(200).json({ ok: true, data: stats });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PRODUCT MANAGEMENT HANDLERS
============================================================ */

/**
 * Orchestrates the creation of a new product definition.
 * Handles binary asset (image) processing if provided.
 */
export async function crearProductoBase(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "PRODUCTOS", "CREAR");

    // Asset Hydration: Construct full URL for the uploaded image
    if (req.file) {
      req.body.foto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const producto = await productosService.crearProductoBase(
      req.gym.id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: producto });
  } catch (err) {
    next(err);
  }
}

/**
 * Persists modifications to an existing product entry.
 */
export async function actualizarProducto(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "PRODUCTOS", "EDITAR");

    if (req.file) {
      req.body.foto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const id = validarId(req.params.id, "Producto ID");

    const producto = await productosService.actualizarProducto(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(200).json({ ok: true, data: producto });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LOGISTICS HANDLERS
============================================================ */

/**
 * Registers an inventory purchase (Stock-in).
 * Triggers automated operational expense logging.
 */
export async function registrarCompra(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "PRODUCTOS", "COMPRAR");

    const id = validarId(req.params.id, "Producto ID");

    const movimiento = await productosService.registrarCompra(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: movimiento });
  } catch (err) {
    next(err);
  }
}

/**
 * Registers an inventory sale (Stock-out).
 * Triggers automated revenue logging.
 */
export async function registrarVenta(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "PRODUCTOS", "VENDER");

    const id = validarId(req.params.id, "Producto ID");

    const movimiento = await productosService.registrarVenta(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: movimiento });
  } catch (err) {
    next(err);
  }
}
