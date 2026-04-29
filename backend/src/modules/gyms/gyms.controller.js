import * as gymsService from './gyms.service.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   HELPERS
============================================================ */

function validarAdmin(req) {
  if (!req.admin) throw new AppError("No autenticado", 401);
}

function validarCampo(valor, nombre) {
  if (!valor || valor.trim().length === 0) {
    throw new AppError(`${nombre} es obligatorio`, 400);
  }
}

/* ============================================================
   LISTAR GYMS DEL ADMIN
============================================================ */

export async function listMyGyms(req, res, next) {
  try {
    validarAdmin(req);

    const gyms = await gymsService.listMyGyms(req.admin.id);

    res.status(200).json({ ok: true, data: gyms });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LISTAR TODOS LOS GYMS (SOLO DUEÑO)
============================================================ */

export async function listAllGyms(req, res, next) {
  try {
    validarAdmin(req);

    const allGyms = await gymsService.listAllGyms();
    const myGyms = await gymsService.listMyGyms(req.admin.id);

    // Agregar flag de "assigned" a cada gymnastio
    const gymsWithStatus = allGyms.map(gym => ({
      ...gym,
      isAssigned: myGyms.some(mg => mg.id === gym.id)
    }));

    res.status(200).json({ ok: true, data: gymsWithStatus });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   CREAR GYM (SOLO DUEÑO)
============================================================ */

export async function createGymForOwner(req, res, next) {
  try {
    validarAdmin(req);

    // Solo un dueño puede crear gyms
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede crear nuevos gimnasios", 403);
    }

    const { nombre, direccion, ciudad, foto, urlWeb } = req.body;

    validarCampo(nombre, "Nombre del gym");

    const gym = await gymsService.createGymForOwner(req.admin.id, {
      nombre,
      direccion: direccion || null,
      ciudad: ciudad || null,
      foto: foto || null,
      urlWeb: urlWeb || null
    });

    res.status(201).json({ ok: true, data: gym });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ASIGNAR GYM EXISTENTE AL DUEÑO
============================================================ */

export async function assignGymToOwner(req, res, next) {
  try {
    validarAdmin(req);

    // Solo un dueño puede asignar gyms
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede asignar gimnasios", 403);
    }

    const { gymId } = req.body;

    if (!gymId) {
      throw new AppError("ID del gimnasio es obligatorio", 400);
    }

    const result = await gymsService.assignGymToOwner(req.admin.id, gymId);

    res.status(200).json({ ok: true, data: result, message: "Gimnasio asignado correctamente" });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ACTUALIZAR GYM
============================================================ */

export async function updateGym(req, res, next) {
  try {
    validarAdmin(req);

    const { id } = req.params;
    const { nombre, direccion, ciudad, foto, urlWeb } = req.body;

    if (!id) {
      throw new AppError("ID del gimnasio es obligatorio", 400);
    }

    const updatedGym = await gymsService.updateGym(id, {
      nombre,
      direccion,
      ciudad,
      foto,
      urlWeb
    });

    if (!updatedGym) {
      throw new AppError("Gimnasio no encontrado", 404);
    }

    res.status(200).json({ ok: true, data: updatedGym, message: "Gimnasio actualizado correctamente" });
  } catch (err) {
    next(err);
  }
}
