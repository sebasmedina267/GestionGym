import * as adminsService from "./admins.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Staff Listing Handler
 * Retrieves all staff members (Admins/Instructors) associated with the 
 * gyms managed by the requesting administrator.
 */
export async function listAdminsForMyGyms(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);

    const admins = await adminsService.listAdminsForMyGyms(req.admin.id);

    res.status(200).json({
      ok: true,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Staff Update Handler
 * Modifies an existing staff member's record. 
 * Supports profile image updates via 'req.file'.
 */
export async function updateAdmin(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);

    const adminId = parseInt(req.params.id);
    const { nombre, apellido, edad, sexo, direccion, gymId } = req.body;

    // Filter and prepare update payload
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
      message: "Staff member updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Staff Deletion Handler
 * Removes a staff member from the system. 
 * Permission is verified within the service layer.
 */
export async function deleteAdmin(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Not authenticated", 401);

    const adminId = parseInt(req.params.id);

    await adminsService.deleteAdmin(req.admin.id, adminId);

    res.status(200).json({
      ok: true,
      message: "Staff member removed successfully",
    });
  } catch (err) {
    next(err);
  }
}
