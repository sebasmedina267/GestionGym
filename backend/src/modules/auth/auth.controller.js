import * as authService from "./auth.service.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   REGISTRO DE DUEÑO
============================================================ */

export async function registerOwner(req, res, next) {
  try {
    const { nombre, apellido, password, gymNombre, gymDireccion } = req.body;

    const result = await authService.registerOwner({
      nombre,
      apellido,
      password,
      gymNombre,
      gymDireccion,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   REGISTRO DE EMPLEADO
============================================================ */

export async function registerEmployee(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);

    // Solo un dueño puede crear empleados
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede registrar empleados", 403);
    }

    const { nombre, apellido, password, gymId } = req.body;
    const foto = req.file?.filename || null;

    const result = await authService.registerEmployee({
      nombre,
      apellido,
      password,
      gymId: Number(gymId),
      foto,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   LOGIN
============================================================ */

export async function login(req, res, next) {
  try {
    const { nombre, apellido, password } = req.body;

    const result = await authService.login({ nombre, apellido, password });

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   SOLICITUD DE RESET DE CONTRASEÑA
============================================================ */

export async function passwordResetRequest(req, res, next) {
  try {
    const { nombre, apellido, newPassword } = req.body;

    await authService.passwordResetRequest({ nombre, apellido, newPassword });

    res.status(200).json({
      ok: true,
      message: "Solicitud de cambio de contraseña registrada (demo, sin email)",
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   RESETEO DE CONTRASEÑA
============================================================ */

export async function passwordReset(req, res, next) {
  try {
    const { token } = req.body;

    await authService.passwordReset({ token });

    res.status(200).json({
      ok: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    next(err);
  }
}
