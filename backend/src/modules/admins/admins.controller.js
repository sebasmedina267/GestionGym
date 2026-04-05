import * as adminsService from "./admins.service.js";
import { AppError } from "../../utils/AppError.js";

export async function listAdminsForMyGyms(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);

    const admins = await adminsService.listAdminsForMyGyms(req.admin.id);

    res.status(200).json({
      ok: true,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdmin(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);

    const adminId = parseInt(req.params.id);
    const { nombre, apellido, edad, sexo, direccion, gymId } = req.body;

    // Preparar datos para actualizar
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (edad !== undefined) updateData.edad = edad;
    if (sexo) updateData.sexo = sexo;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (gymId) updateData.gymId = gymId;
    if (req.file) updateData.foto = req.file.filename;

    const updated = await adminsService.updateAdmin(req.admin.id, adminId, updateData);

    res.status(200).json({
      ok: true,
      message: "Administrador actualizado correctamente",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdmin(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);

    const adminId = parseInt(req.params.id);

    await adminsService.deleteAdmin(req.admin.id, adminId);

    res.status(200).json({
      ok: true,
      message: "Administrador eliminado correctamente",
    });
  } catch (err) {
    next(err);
  }
}
