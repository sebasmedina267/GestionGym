import * as maquinasRepository from './maquinas.repository.js';
import { AppError } from '../../utils/AppError.js';
import { registrarOperacion } from '../audit/audit.service.js';

/* ============================================================
   LISTAR MÁQUINAS
============================================================ */

export async function listarMaquinas(gymId) {
  return maquinasRepository.findByGym(gymId);
}

/* ============================================================
   CREAR MÁQUINA (SOLO DUEÑO)
============================================================ */

export async function crearMaquina(gymId, data, admin) {
  if (!admin.roles.includes("DUENO")) {
    throw new AppError("Solo un dueño puede crear máquinas", 403);
  }

  if (!data.nombre || data.nombre.trim().length === 0) {
    throw new AppError("El nombre de la máquina es obligatorio", 400);
  }

  const maquina = await maquinasRepository.create(gymId, data);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MAQUINA",
    entidadId: maquina.id,
    accion: "CREAR",
    detalles: data
  });

  return maquina;
}

/* ============================================================
   ACTUALIZAR MÁQUINA (DUEÑO Y EMPLEADO)
============================================================ */

export async function actualizarMaquina(gymId, id, data, admin) {
  const maquina = await maquinasRepository.getById(gymId, id);
  if (!maquina) throw new AppError("Máquina no encontrada", 404);

  const updated = await maquinasRepository.update(gymId, id, data);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MAQUINA",
    entidadId: id,
    accion: "ACTUALIZAR",
    detalles: data
  });

  return updated;
}

/* ============================================================
   ELIMINAR MÁQUINA (SOLO DUEÑO)
============================================================ */

export async function eliminarMaquina(gymId, id, admin) {
  if (!admin.roles.includes("DUENO")) {
    throw new AppError("Solo un dueño puede eliminar máquinas", 403);
  }

  const maquina = await maquinasRepository.getById(gymId, id);
  if (!maquina) throw new AppError("Máquina no encontrada", 404);

  await maquinasRepository.remove(gymId, id);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "MAQUINA",
    entidadId: id,
    accion: "ELIMINAR"
  });
}
