import * as clientesService from './clientes.service.js';
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

/* ============================================================
   LISTAR CLIENTES
============================================================ */

export async function listarClientes(req, res, next) {
  try {
    validarAdmin(req);

    const clientes = await clientesService.listarClientes(req.gym.id);

    res.status(200).json({ ok: true, data: clientes });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ESTADÍSTICAS
============================================================ */

export async function estadisticasClientes(req, res, next) {
  try {
    validarAdmin(req);

    const stats = await clientesService.estadisticasClientes(req.gym.id);

    res.status(200).json({ ok: true, data: stats });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   CREAR CLIENTE
============================================================ */

export async function crearCliente(req, res, next) {
  try {
    validarAdmin(req);

    const data = req.body;

    const cliente = await clientesService.crearCliente(
      req.gym.id,
      data,
      req.admin
    );

    res.status(201).json({ ok: true, data: cliente });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ACTUALIZAR CLIENTE
============================================================ */

export async function actualizarCliente(req, res, next) {
  try {
    validarAdmin(req);

    const id = validarId(req.params.id, "Cliente ID");
    const data = req.body;

    const cliente = await clientesService.actualizarCliente(
      req.gym.id,
      id,
      data,
      req.admin
    );

    res.status(200).json({ ok: true, data: cliente });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ELIMINAR CLIENTE
============================================================ */

export async function eliminarCliente(req, res, next) {
  try {
    validarAdmin(req);

    // Solo dueño puede eliminar clientes
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede eliminar clientes", 403);
    }

    const id = validarId(req.params.id, "Cliente ID");

    await clientesService.eliminarCliente(req.gym.id, id, req.admin);

    res.status(200).json({ ok: true, message: "Cliente eliminado" });
  } catch (err) {
    next(err);
  }
}
