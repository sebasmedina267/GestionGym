import * as authRepository from "./auth.repository.js";
import { hashPassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";
import { pool } from "../../config/db.js";
import { validarPassword } from "./auth.service.js";

/* ============================================================
   EMPLOYEE REGISTRATION
   ============================================================ */

/**
 * Registers a new employee for a specific gym branch.
 * Enforces business rules: target gym must have an owner, and employees are single-branch.
 * @param {Object} data - Employee details (name, lastname, password, gymId)
 * @returns {Promise<Object>} The new employee's data and session token.
 */
export async function registerEmployee({ nombre, apellido, password, gymId }) {
  if (!nombre || !apellido || !password || !gymId) {
    throw new AppError("Incomplete data for employee registration", 400);
  }

  validarPassword(password);

  // Verify that the target gym has an owner
  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("No owner exists for this gym", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Create administrator account
    const admin = await authRepository.createAdmin({
      nombre,
      apellido,
      passwordHash,
    });

    // Employees are restricted to a single gym branch
    const gymsPrevios = await authRepository.getGymsByAdminId(admin.id);
    if (gymsPrevios.length > 0) {
      throw new AppError("An employee can only belong to one gym", 400);
    }

    // Link administrator as an employee to the specified gym
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

    // Log registration in audit
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

/**
 * Registers an employee account using email credentials.
 * Links the employee to a specific gym branch upon creation.
 * @param {Object} data - Employee profile and target branch ID.
 * @returns {Promise<Object>} Authenticated session data.
 */
export async function registerEmployeeWithEmail({
  nombre,
  apellido,
  email,
  password,
  gymId,
  rol,
  foto,
}) {
  if (!nombre || !apellido || !email || !password || !gymId) {
    throw new AppError("Incomplete data for employee registration", 400);
  }

  validarPassword(password);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) throw new AppError("Invalid email address", 400);

  if (await authRepository.emailExists(email)) {
    throw new AppError("Email is already registered", 409);
  }

  const ownerExists = await authRepository.findOwnerByGymId(gymId);
  if (!ownerExists) throw new AppError("Target gym must have an active owner", 400);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const passwordHash = await hashPassword(password);

    // Create employee administrator account
    const admin = await authRepository.createAdminWithEmail({
      nombre,
      apellido,
      email,
      passwordHash,
    });

    // Link as employee or manager role
    await authRepository.linkAdminToGym({
      adminId: admin.id,
      gymId,
      rol: rol || "EMPLEADO",
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

    // Audit registration
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
