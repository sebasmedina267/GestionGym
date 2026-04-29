import * as authRepository from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";
import crypto from "crypto";
import { pool } from "../../config/db.js";

/* ============================================================
   VALIDACIÓN DE CONTRASEÑA FUERTE
============================================================ */

function validarPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!regex.test(password)) {
    throw new AppError(
      "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo",
      400,
    );
  }
}

/* ============================================================
   REGISTRO DE DUEÑO
============================================================ */

export async function registerOwner({
  nombre,
  apellido,
  password,
  gymNombre,
  gymDireccion,
}) {
  if (!nombre || !apellido || !password || !gymNombre) {
    throw new AppError("Datos incompletos para registrar dueño", 400);
  }

  validarPassword(password);


  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Crear admin
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Crear gym
    const gym = await authRepository.createGym({
      nombre: gymNombre,
      direccion: gymDireccion || null,
    });

    // Vincular admin como dueño
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId: gym.id,
      rol: "DUENO",
    });

    await conn.commit();

    const gyms = await authRepository.getGymsByAdminId(admin.id);
    const roles = await authRepository.getRolesByAdminId(admin.id);

    const token = signToken({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Auditoría
    await registrarOperacion({
      adminId: admin.id,
      gymId: gym.id,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REGISTRO_DUENO",
      detalles: { nombre, apellido },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* ============================================================
   REGISTRO DE EMPLEADO
============================================================ */

export async function registerEmployee({ nombre, apellido, password, gymId }) {
  if (!nombre || !apellido || !password || !gymId) {
    throw new AppError("Datos incompletos para registrar empleado", 400);
  }

  validarPassword(password);

  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("No existe dueño para este gym", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Crear admin
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Validar que el empleado NO tenga otros gyms
    const gymsPrevios = await authRepository.getGymsByAdminId(admin.id);
    if (gymsPrevios.length > 0) {
      throw new AppError("Un empleado solo puede pertenecer a un gym", 400);
    }

    // Vincular admin como empleado
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId,
      rol: "EMPLEADO",
    });

    await conn.commit();

    const gyms = await authRepository.getGymsByAdminId(admin.id);
    const roles = await authRepository.getRolesByAdminId(admin.id);

    const token = signToken({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Auditoría
    await registrarOperacion({
      adminId: admin.id,
      gymId,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REGISTRO_EMPLEADO",
      detalles: { nombre, apellido },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* ============================================================
   LOGIN
============================================================ */

export async function login({ nombre, apellido, password }) {
  if (!nombre || !apellido || !password) {
    throw new AppError("Datos incompletos para login", 400);
  }

  const admin = await authRepository.findAdminByNombreApellido(
    nombre,
    apellido,
  );
  if (!admin) throw new AppError("Credenciales inválidas", 401);

  const ok = await comparePassword(password, admin.password);
  if (!ok) throw new AppError("Credenciales inválidas", 401);

  // Actualizar último login
  await authRepository.updateLastLogin(admin.id);

  const gyms = await authRepository.getGymsByAdminId(admin.id);
  const roles = await authRepository.getRolesByAdminId(admin.id);

  const token = signToken({
    id: admin.id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    roles,
    gyms: gyms.map((g) => g.id),
  });

  // Auditoría
  await registrarOperacion({
    adminId: admin.id,
    gymId: gyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "LOGIN",
  });

  return { admin, gyms, roles, token };
}

/* ============================================================
   SOLICITUD DE RESET DE CONTRASEÑA
============================================================ */

export async function passwordResetRequest({ nombre, apellido, newPassword }) {
  if (!nombre || !apellido || !newPassword) {
    throw new AppError("Datos incompletos para resetear contraseña", 400);
  }

  validarPassword(newPassword);

  const admin = await authRepository.findAdminByNombreApellido(
    nombre,
    apellido,
  );
  if (!admin) throw new AppError("Administrador no encontrado", 404);

  const token = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(newPassword);

  await authRepository.createPasswordReset({
    adminId: admin.id,
    token,
    passwordHash,
  });

  console.log("Token reset:", token);

  return { mensaje: "Token generado" };
}

/* ============================================================
   RESETEO DE CONTRASEÑA
============================================================ */

export async function passwordReset({ token }) {
  if (!token) throw new AppError("Token requerido", 400);

  const reset = await authRepository.findPasswordResetByToken(token);
  if (!reset) throw new AppError("Token inválido o expirado", 400);

  // Actualizar contraseña
  await authRepository.updatePassword(reset.admin_id, reset.password_hash);

  // Eliminar token
  await authRepository.deletePasswordReset(token);

  return { mensaje: "Contraseña actualizada correctamente" };
}

/* ============================================================
   NUEVAS FUNCIONES CON EMAIL (PUNTO 2)
============================================================ */

/**
 * REGISTRO DE DUEÑO CON EMAIL
 * Nuevo flujo de registro que incluye email
 */
export async function registerOwnerWithEmail({
  nombre,
  apellido,
  email,
  password,
  gymNombre,
  gymDireccion,
  gymUrlWeb,
  gymFoto,
}) {
  console.log(">>> EJECUTANDO registerOwnerWithEmail v2 <<<");
  if (!nombre || !apellido || !email || !password || !gymNombre) {
    throw new AppError("Datos incompletos para registrar dueño", 400);
  }

  validarPassword(password);

  // Validar email
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Email inválido", 400);

  // Verificar si email ya existe
  const existingUser = await authRepository.findAdminByEmailRaw(email);
  if (existingUser) {
    if (existingUser.activo) {
      throw new AppError("El email ya está registrado y activo", 409);
    } else {
      // Si existe pero no está activo, borramos el intento previo para empezar de cero
      // Esto evita conflictos con el gym, etc.
      await authRepository.deleteAdminByEmail(email);
    }
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Crear admin con email
    const admin = await authRepository.createAdminWithEmail({
      nombre,
      apellido,
      email,
      passwordHash,
      activo: false,
    });

    // Crear gym
    const gym = await authRepository.createGym({
      nombre: gymNombre,
      direccion: gymDireccion || null,
      urlWeb: gymUrlWeb || null,
      foto: gymFoto || null,
    });

    // Vincular admin como dueño
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId: gym.id,
      rol: "DUENO",
    });

    await conn.commit();

    const gyms = await authRepository.getGymsByAdminId(admin.id);
    const roles = await authRepository.getRolesByAdminId(admin.id);

    const token = signToken({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      email: admin.email,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Auditoría
    await registrarOperacion({
      adminId: admin.id,
      gymId: gym.id,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REG_DUENO_EMAIL",
      detalles: { nombre, apellido, email },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * ACTIVAR DUEÑO TRAS PAGO
 */
export async function activateOwner(email) {
  if (!email) throw new AppError("Email requerido", 400);

  const admin = await authRepository.findAdminByEmailRaw(email);
  if (!admin) throw new AppError("Administrador no encontrado", 404);

  if (admin.activo) return { mensaje: "La cuenta ya está activa" };

  await pool.query("UPDATE admins SET activo = 1 WHERE id = ?", [admin.id]);

  // Auditoría de activación
  await registrarOperacion({
    adminId: admin.id,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "ACTIVACION_PAGO",
    detalles: { email },
  });

  return { mensaje: "Cuenta activada correctamente" };
}

/**
 * REGISTRO DE EMPLEADO CON EMAIL
 * Incluye email como campo obligatorio
 */
export async function registerEmployeeWithEmail({
  nombre,
  apellido,
  email,
  password,
  gymId,
  foto,
}) {
  if (!nombre || !apellido || !email || !password || !gymId) {
    throw new AppError("Datos incompletos para registrar empleado", 400);
  }

  validarPassword(password);

  // Validar email
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Email inválido", 400);

  // Verificar si email ya existe
  if (await authRepository.emailExists(email)) {
    throw new AppError("El email ya está registrado", 409);
  }

  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("No existe dueño para este gym", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Crear admin con email
    const admin = await authRepository.createAdminWithEmail({
      nombre,
      apellido,
      email,
      passwordHash,
    });

    // Vincular admin como empleado
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId,
      rol: "EMPLEADO",
    });

    await conn.commit();

    const gyms = await authRepository.getGymsByAdminId(admin.id);
    const roles = await authRepository.getRolesByAdminId(admin.id);

    const token = signToken({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      email: admin.email,
      roles,
      gyms: gyms.map((g) => g.id),
    });

    // Auditoría
    await registrarOperacion({
      adminId: admin.id,
      gymId,
      entidad: "ADMIN",
      entidadId: admin.id,
      accion: "REG_EMP_EMAIL",
      detalles: { nombre, apellido, email },
    });

    return { admin, gyms, roles, token };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * LOGIN CON EMAIL
 * Nuevo flujo de login basado en email
 */
export async function loginWithEmail({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email y contraseña requeridos", 400);
  }

  const admin = await authRepository.findAdminByEmail(email);
  if (!admin) throw new AppError("Credenciales inválidas", 401);

  const ok = await comparePassword(password, admin.password);
  if (!ok) throw new AppError("Credenciales inválidas", 401);

  // Actualizar último login
  await authRepository.updateLastLogin(admin.id);

  const gyms = await authRepository.getGymsByAdminId(admin.id);
  const roles = await authRepository.getRolesByAdminId(admin.id);

  const token = signToken({
    id: admin.id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    email: admin.email,
    roles,
    gyms: gyms.map((g) => g.id),
  });

  // Auditoría
  await registrarOperacion({
    adminId: admin.id,
    gymId: gyms[0]?.id || null,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "LOGIN_EMAIL",
  });

  return { admin, gyms, roles, token };
}

/**
 * RECUPERAR CONTRASEÑA - NUEVO FLUJO
 * Genera token para reset de contraseña
 */
export async function requestPasswordReset(email) {
  if (!email) throw new AppError("Email requerido", 400);

  // Buscar si es admin o usuario final
  let tipo_usuario = null;
  let user = await authRepository.findAdminByEmail(email);

  if (!user) {
    user = await authRepository.findUserFinalByEmail(email);
    if (user) tipo_usuario = "USUARIO_FINAL";
  } else {
    tipo_usuario = "ADMIN";
  }

  if (!user) {
    // Por seguridad, no revelar si el email existe
    return { mensaje: "Si el email existe, recibirá un enlace de recuperación" };
  }

  // Generar token
  const token = crypto.randomBytes(32).toString("hex");

  // Guardar en BD
  await authRepository.createPasswordResetToken({
    email,
    token,
    tipo_usuario,
  });

  // TODO: Enviar email con enlace
  // Formato: https://app.com/reset-password?token={token}

  return { mensaje: "Email de recuperación enviado", token }; // En producción, no retornar token
}

/**
 * RESET DE CONTRASEÑA - NUEVO FLUJO
 */
export async function resetPassword({ token, newPassword }) {
  if (!token || !newPassword) {
    throw new AppError("Token y nueva contraseña requeridos", 400);
  }

  validarPassword(newPassword);

  // Buscar token válido
  const resetToken = await authRepository.findPasswordResetToken(token);
  if (!resetToken) throw new AppError("Token inválido o expirado", 400);

  const passwordHash = await hashPassword(newPassword);

  // Actualizar contraseña según tipo de usuario
  if (resetToken.tipo_usuario === "ADMIN") {
    const admin = await authRepository.findAdminByEmail(resetToken.email);
    if (!admin) throw new AppError("Administrador no encontrado", 404);
    await authRepository.updatePassword(admin.id, passwordHash);
  } else if (resetToken.tipo_usuario === "USUARIO_FINAL") {
    const user = await authRepository.findUserFinalByEmail(resetToken.email);
    if (!user) throw new AppError("Usuario no encontrado", 404);
    await authRepository.updateUserFinalPassword(user.id, passwordHash);
  }

  // Marcar token como usado
  await authRepository.usePasswordResetToken(resetToken.id);

  return { mensaje: "Contraseña actualizada correctamente" };
}

/**
 * REGISTRO DE USUARIO FINAL (USUARIO DE APP)
 */
export async function registerUserFinal({ email, nombre, apellido, password }) {
  if (!email || !nombre || !apellido || !password) {
    throw new AppError("Datos incompletos", 400);
  }

  validarPassword(password);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Email inválido", 400);

  if (await authRepository.userFinalEmailExists(email)) {
    throw new AppError("El email ya está registrado", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await authRepository.createUserFinal({
    email,
    nombre,
    apellido,
    passwordHash,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    tipo: "USUARIO_FINAL",
  });

  return { user, token };
}

/**
 * LOGIN DE USUARIO FINAL
 */
export async function loginUserFinal({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email y contraseña requeridos", 400);
  }

  const user = await authRepository.findUserFinalByEmail(email);
  if (!user) throw new AppError("Credenciales inválidas", 401);

  const ok = await comparePassword(password, user.password);
  if (!ok) throw new AppError("Credenciales inválidas", 401);

  const gyms = await authRepository.getGymsForUser(user.id);

  const token = signToken({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    tipo: "USUARIO_FINAL",
    gyms: gyms.map((g) => g.id),
  });

  return { user, gyms, token };
}

/**
 * INSCRIBIR USUARIO EN GIMNASIO
 */
export async function enrollUserInGym({ userId, gymId, metodo_pago = "APP" }) {
  if (!userId || !gymId) {
    throw new AppError("Usuario y gimnasio requeridos", 400);
  }

  // Validar que el gym existe
  const gym = await authRepository.gymExists(gymId);
  if (!gym) throw new AppError("Gimnasio no encontrado", 404);

  // Validar que el usuario existe
  const user = await authRepository.findUserFinalById(userId);
  if (!user) throw new AppError("Usuario no encontrado", 404);

  await authRepository.enrollUserInGym({
    userId,
    gymId,
    metodo_pago,
  });

  return { mensaje: "Usuario inscrito en el gimnasio" };
}

/* ============================================================
   FUNCIONES PARA INTEGRACIÓN CON STRIPE - PAGOS
============================================================ */

/**
 * CONFIRMAR REGISTRO DE DUEÑO DESPUÉS DE PAGO
 * Se ejecuta cuando Stripe confirma el pago exitoso
 */
export async function confirmOwnerRegistrationAfterPayment(email, paymentIntentId) {
  if (!email || !paymentIntentId) {
    throw new AppError("Email y Payment Intent requeridos", 400);
  }

  // Buscar admin por email
  const admin = await authRepository.findAdminByEmailRaw(email);
  if (!admin) throw new AppError("Registro no encontrado", 404);

  // Activar cuenta
  await pool.query(
    "UPDATE admins SET activo = 1, stripe_payment_intent = ? WHERE id = ?",
    [paymentIntentId, admin.id]
  );

  // Auditoría
  await registrarOperacion({
    adminId: admin.id,
    entidad: "ADMIN",
    entidadId: admin.id,
    accion: "CONFIRMACION_PAGO_DUENO",
    detalles: { email, paymentIntentId },
  });

  // Generar token para login automático
  const gyms = await authRepository.getGymsByAdminId(admin.id);
  const roles = await authRepository.getRolesByAdminId(admin.id);

  const token = signToken({
    id: admin.id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    email: admin.email,
    roles,
    gyms: gyms.map((g) => g.id),
  });

  return {
    mensaje: "Pago confirmado, cuenta activada",
    admin,
    gyms,
    roles,
    token,
  };
}

/**
 * CREAR NUEVA SUCURSAL DESPUÉS DE PAGO
 * Solo dueños pueden crear sucursales (previo pago)
 */
export async function createBranchAfterPayment({
  ownerId,
  nombre,
  direccion,
  ciudad,
  urlWeb,
  foto,
  paymentIntentId,
}) {
  if (!ownerId || !nombre || !paymentIntentId) {
    throw new AppError("Datos incompletos para crear sucursal", 400);
  }

  // Validar que sea dueño
  const ownerRole = await authRepository.getAdminRole(ownerId);
  if (!ownerRole || !ownerRole.includes("DUENO")) {
    throw new AppError("Solo dueños pueden crear sucursales", 403);
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Crear novo gym
    const gym = await authRepository.createGym({
      nombre,
      direccion: direccion || null,
      ciudad: ciudad || null,
      urlWeb: urlWeb || null,
      foto: foto || null,
    });

    // Vincular dueño a nuevo gym
    await authRepository.linkAdminToGym({
      adminId: ownerId,
      gymId: gym.id,
      rol: "DUENO",
    });

    await conn.commit();

    // Auditoría
    await registrarOperacion({
      adminId: ownerId,
      gymId: gym.id,
      entidad: "GYM",
      entidadId: gym.id,
      accion: "CREACION_SUCURSAL_PAGADA",
      detalles: { nombre, paymentIntentId },
    });

    return { mensaje: "Sucursal creada exitosamente", gym };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
