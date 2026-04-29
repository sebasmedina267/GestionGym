import * as authService from "./auth.service.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   REGISTRO DE DUEÑO
=========================================================== */

export async function registerOwner(req, res, next) {
  try {
    const { nombre, apellido, email, password, gymNombre, gymDireccion, gymUrlWeb } = req.body;
    const gymFoto = req.file?.filename || null;

    const result = await authService.registerOwnerWithEmail({
      nombre,
      apellido,
      email,
      password,
      gymNombre,
      gymDireccion,
      gymUrlWeb,
      gymFoto,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   ACTIVACIÓN DE DUEÑO
=========================================================== */

export async function activateOwner(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.activateOwner(email);
    res.status(200).json({ ok: true, message: result.mensaje });
  } catch (err) {
    next(err);
  }
}


/* ============================================================
   REGISTRO DE EMPLEADO
=========================================================== */

export async function registerEmployee(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);

    // Solo un dueño puede crear empleados
    if (!req.admin.roles.includes("DUENO")) {
      throw new AppError("Solo un dueño puede registrar empleados", 403);
    }

    const { nombre, apellido, email, password, gymId } = req.body;
    const foto = req.file?.filename || null;

    const result = await authService.registerEmployeeWithEmail({
      nombre,
      apellido,
      email,
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
=========================================================== */

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginWithEmail({ email, password });

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   SOLICITUD DE RESET DE CONTRASEÑA
=========================================================== */

export async function passwordResetRequest(req, res, next) {
  try {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      ok: true,
      message: result.mensaje,
      token: result.token // En dev retornamos el token, en prod iría por email
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   RESETEO DE CONTRASEÑA
=========================================================== */

export async function passwordReset(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword({ token, newPassword });

    res.status(200).json({
      ok: true,
      message: result.mensaje,
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   USUARIO FINAL (APP) - REGISTRO Y LOGIN
=========================================================== */

export async function registerUserFinal(req, res, next) {
  try {
    const { email, nombre, apellido, password } = req.body;
    const result = await authService.registerUserFinal({ email, nombre, apellido, password });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function loginUserFinal(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUserFinal({ email, password });
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function enrollUserGym(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    
    const userId = req.admin.id; 
    const { gymId, metodo_pago } = req.body;

    const result = await authService.enrollUserInGym({
      userId,
      gymId: Number(gymId),
      metodo_pago
    });
    
    res.status(200).json({ ok: true, message: result.mensaje });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   CONFIRMACIÓN DESPUÉS DE PAGOS STRIPE
=========================================================== */

/**
 * CONFIRMAR REGISTRO DE DUEÑO DESPUÉS DE PAGO
 */
export async function confirmOwnerPayment(req, res, next) {
  try {
    const { email, paymentIntentId } = req.body;

    if (!email || !paymentIntentId) {
      throw new AppError("Email y Payment Intent ID requeridos", 400);
    }

    const result = await authService.confirmOwnerRegistrationAfterPayment(
      email,
      paymentIntentId
    );

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * CREAR SUCURSAL DESPUÉS DE PAGO
 */
export async function createBranchAfterPayment(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);

    const { nombre, direccion, ciudad, urlWeb, paymentIntentId } = req.body;
    const foto = req.file?.filename || null;

    const result = await authService.createBranchAfterPayment({
      ownerId: req.admin.id,
      nombre,
      direccion,
      ciudad,
      urlWeb,
      foto,
      paymentIntentId,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}
