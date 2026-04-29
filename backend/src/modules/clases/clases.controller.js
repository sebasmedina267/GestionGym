import * as clasesService from "./clases.service.js";
import { AppError } from "../../utils/AppError.js";
import { validatePermission } from "../../utils/rolePermissions.js";

export async function listarClases(req, res, next) {
  try {
    const gymId = req.gym.id;
    const clases = await clasesService.listarClases(gymId);
    res.status(200).json({ ok: true, data: clases });
  } catch (err) {
    next(err);
  }
}

export async function crearClase(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    validatePermission(req.admin.roles, "CLASES", "CREAR");
    const gymId = req.gym.id;
    const clase = await clasesService.crearClase(gymId, req.body, req.admin);
    res.status(201).json({ ok: true, data: clase });
  } catch (err) {
    next(err);
  }
}

export async function actualizarClase(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    validatePermission(req.admin.roles, "CLASES", "EDITAR");
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const clase = await clasesService.actualizarClase(gymId, claseId, req.body, req.admin);
    res.status(200).json({ ok: true, data: clase });
  } catch (err) {
    next(err);
  }
}

export async function eliminarClase(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    validatePermission(req.admin.roles, "CLASES", "ELIMINAR");
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    await clasesService.eliminarClase(gymId, claseId, req.admin);
    res.status(200).json({ ok: true, message: "Clase eliminada" });
  } catch (err) {
    next(err);
  }
}

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

export async function crearHorario(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    validatePermission(req.admin.roles, "CLASES", "CREAR_HORARIO");
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const horario = await clasesService.crearHorario(gymId, claseId, req.body, req.admin);
    res.status(201).json({ ok: true, data: horario });
  } catch (err) {
    next(err);
  }
}

export async function eliminarHorario(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    validatePermission(req.admin.roles, "CLASES", "ELIMINAR_HORARIO");
    const gymId = req.gym.id;
    const horarioId = Number(req.params.horarioId);
    await clasesService.eliminarHorario(gymId, horarioId, req.admin);
    res.status(200).json({ ok: true, message: "Horario eliminado" });
  } catch (err) {
    next(err);
  }
}

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

export async function inscribirCliente(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
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

export async function desinscribirCliente(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
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
    res.status(200).json({ ok: true, message: "Cliente desinscrito" });
  } catch (err) {
    next(err);
  }
}

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

export async function clasesConCurrencia(req, res, next) {
  try {
    const gymId = req.gym.id;
    const clases = await clasesService.obtenerClasesConCurrencia(gymId);
    res.status(200).json({ ok: true, data: clases });
  } catch (err) {
    next(err);
  }
}

export async function actualizarHorario(req, res, next) {
  try {
    const { horarioId } = req.params;
    const data = req.body;
    const admin = req.user;
    const gymId = req.gym.id;

    const horario = await clasesService.actualizarHorario(
      gymId,
      Number(horarioId),
      data,
      admin
    );

    res.json({ data: horario });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   MONITORES
============================================================ */

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

export async function agregarMonitor(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const { admin_id } = req.body;
    
    await clasesService.agregarMonitor(gymId, claseId, admin_id, req.admin);
    res.status(201).json({ ok: true, message: "Monitor agregado" });
  } catch (err) {
    next(err);
  }
}

export async function removerMonitor(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const monitorId = Number(req.params.monitorId);
    
    await clasesService.removerMonitor(gymId, claseId, monitorId, req.admin);
    res.status(200).json({ ok: true, message: "Monitor removido" });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PRECIOS
============================================================ */

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

export async function crearPrecio(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    const gymId = req.gym.id;
    const claseId = Number(req.params.id);
    const precio = await clasesService.crearPrecio(gymId, claseId, req.body, req.admin);
    res.status(201).json({ ok: true, data: precio });
  } catch (err) {
    next(err);
  }
}

export async function actualizarPrecio(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    const precioId = Number(req.params.precioId);
    const precio = await clasesService.actualizarPrecio(precioId, req.body, req.admin);
    res.status(200).json({ ok: true, data: precio });
  } catch (err) {
    next(err);
  }
}

export async function eliminarPrecio(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    const precioId = Number(req.params.precioId);
    await clasesService.eliminarPrecio(precioId, req.admin);
    res.status(200).json({ ok: true, message: "Precio eliminado" });
  } catch (err) {
    next(err);
  }
}
