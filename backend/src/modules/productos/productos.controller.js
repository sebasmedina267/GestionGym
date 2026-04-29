import * as productosService from './productos.service.js';
import { AppError } from '../../utils/AppError.js';
import { validatePermission } from '../../utils/rolePermissions.js';

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
   LISTAR PRODUCTOS
============================================================ */

export async function listarProductos(req, res, next) {
  try {
    validarAdmin(req);

    const productos = await productosService.listarProductos(req.gym.id);

    res.status(200).json({ ok: true, data: productos });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LISTAR MOVIMIENTOS
============================================================ */

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

/* ============================================================
   ESTADÍSTICAS
============================================================ */

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
   CREAR PRODUCTO BASE
============================================================ */

export async function crearProductoBase(req, res, next) {
  try {
    validarAdmin(req);
    validatePermission(req.admin.roles, "PRODUCTOS", "CREAR");

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

/* ============================================================
   ACTUALIZAR PRODUCTO
============================================================ */

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
   REGISTRAR COMPRA
============================================================ */

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

/* ============================================================
   REGISTRAR VENTA
============================================================ */

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
