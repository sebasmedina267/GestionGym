import * as maquinasService from './maquinas.service.js';
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
   LISTAR MÁQUINAS
============================================================ */

export async function listarMaquinas(req, res, next) {
  try {
    validarAdmin(req);

    const maquinas = await maquinasService.listarMaquinas(req.gym.id);

    res.status(200).json({ ok: true, data: maquinas });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   CREAR MÁQUINA
============================================================ */

export async function crearMaquina(req, res, next) {
  try {
    validarAdmin(req);

    if (req.file) {
      req.body.foto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const maquina = await maquinasService.crearMaquina(
      req.gym.id,
      req.body,
      req.admin
    );

    res.status(201).json({ ok: true, data: maquina });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ACTUALIZAR MÁQUINA
============================================================ */

export async function actualizarMaquina(req, res, next) {
  try {
    validarAdmin(req);

    if (req.file) {
      req.body.foto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const id = validarId(req.params.id, "Máquina ID");

    const maquina = await maquinasService.actualizarMaquina(
      req.gym.id,
      id,
      req.body,
      req.admin
    );

    res.status(200).json({ ok: true, data: maquina });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ELIMINAR MÁQUINA
============================================================ */

export async function eliminarMaquina(req, res, next) {
  try {
    validarAdmin(req);

    const id = validarId(req.params.id, "Máquina ID");

    await maquinasService.eliminarMaquina(req.gym.id, id, req.admin);

    res.status(200).json({ ok: true, message: "Máquina eliminada" });
  } catch (err) {
    next(err);
  }
}
