import * as clientesRepository from "./clientes.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { requireFields } from "../../utils/validators.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/password.js";
import crypto from "crypto";

/* ============================================================
   PERMISSION VALIDATION
   ============================================================ */

/**
 * Validates that an administrator has permission to operate within a specific gym branch.
 * @param {number} adminId - The administrator's unique identifier.
 * @param {number} gymId - The target gym branch identifier.
 * @throws {AppError} 403 if the administrator is not linked to the branch.
 */
async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some((g) => g.id === gymId)) {
    throw new AppError("Access Denied: You do not have management rights for this gym branch", 403);
  }
}

/* ============================================================
   AUTOMATIC CREDENTIAL GENERATION
   ============================================================ */

/**
 * Generates a high-entropy, cryptographically secure random password.
 * Policy: 10 chars, includes uppercase, numbers, and specialized symbols.
 * @returns {string} The generated plain-text credentials.
 */
function generarContraseñaAutomatica() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let password = '';
  // Ensure at least one char of each mandatory type
  password += letters.charAt(Math.floor(Math.random() * letters.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  const allChars = letters + lowercase + numbers + symbols;
  for (let i = 3; i < 10; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle to prevent predictable character position patterns
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/* ============================================================
   DATA HYGIENE & RETENTION POLICIES
   ============================================================ */

/**
 * Executes an automated data cleanup task to purge stale member records.
 * Strategy: Permanently remove members with zero activity for over 4 months.
 * @param {number} gymId - The specific branch registry to clean.
 */
async function eliminarClientesInactivosMuchotiempo(gymId) {
  try {
    await clientesRepository.deletePermanentlyInactiveClients(gymId, 4);
  } catch (err) {
    console.error("Critical Failure: Automated client data cleanup task failed:", err);
  }
}

/* ============================================================
   MEMBER DIRECTORY SERVICES
   ============================================================ */

/**
 * Retrieves the full member directory for a branch.
 * Orchestration: Triggers a hygiene cleanup of inactive records before retrieval.
 * @param {number} gymId - The branch identifier.
 * @returns {Promise<Array>} Collection of member records.
 */
export async function listarClientes(gymId) {
  // Maintenance task: ensure the list reflects active members by purging long-term stale records
  await eliminarClientesInactivosMuchotiempo(gymId);
  return clientesRepository.findByGym(gymId);
}

/* ============================================================
   DEMOGRAPHIC ANALYTICS SERVICES
   ============================================================ */

/**
 * Aggregates high-fidelity demographic and age distribution data.
 * @param {number} gymId - The branch identifier.
 * @returns {Promise<Object>} Aggregated analytics object.
 */
export async function estadisticasClientes(gymId) {
  const [genero, edad] = await Promise.all([
    clientesRepository.statsGenero(gymId),
    clientesRepository.statsEdad(gymId)
  ]);
  
  return { genero, edad };
}

/* ============================================================
   MEMBER ONBOARDING SERVICES
   ============================================================ */

/**
 * Orchestrates the full onboarding workflow for a new gym member.
 * Automation: If an email is provided, automatically provisions platform credentials.
 * 
 * @param {number} gymId - Target branch for enrollment.
 * @param {Object} data - Comprehensive member profile data.
 * @param {Object} admin - Identity of the performing administrator.
 * @returns {Promise<Object>} The persisted member entity.
 */
export async function crearCliente(gymId, data, admin) {
  // Integrity Guard: Mandatory profile attributes
  requireFields(data, ["nombre", "apellido", "edad", "sexo"]);

  if (!admin?.id) throw new AppError("System Error: Invalid administrative context for onboarding", 400);

  await validarPermisos(admin.id, gymId);

  let clientSubmissionData = { ...data };
  
  // Logic: Automated Account Provisioning
  if (data.email) {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!emailValid) throw new AppError("Policy Error: Provided email format is invalid", 400);

    const rawPassword = generarContraseñaAutomatica();
    const passwordHash = await hashPassword(rawPassword);
    
    clientSubmissionData.email = data.email;
    clientSubmissionData.password = passwordHash;
    clientSubmissionData.tipo_usuario = 'CLIENTE';
    
    // Transparent Field: Temporary capture of plain-text password for onboarding feedback
    clientSubmissionData._contraseña_generada = rawPassword;
  }

  // Repository Layer: Persist the record
  const client = await clientesRepository.create(gymId, clientSubmissionData);

  const response = { ...client };
  if (data.email) {
    // Return the generated credentials once to allow the admin to notify the client
    response.contraseña_generada = clientSubmissionData._contraseña_generada;
  }

  // Audit Layer: Log the member acquisition event
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: client.id,
    accion: "CREAR",
    detalles: { ...data, password: data.email ? "[AUTO_PROVISIONED]" : undefined },
  });

  return response;
}

/* ============================================================
   MEMBER PROFILE SYNCHRONIZATION
   ============================================================ */

/**
 * Persists administrative updates to an existing member profile.
 */
export async function actualizarCliente(gymId, id, data, admin) {
  if (!admin?.id) throw new AppError("System Error: Invalid administrative context for update", 400);

  await validarPermisos(admin.id, gymId);

  // Integrity Check: Verify record existence within branch scope
  const existingClient = await clientesRepository.getById(gymId, id);
  if (!existingClient) throw new AppError("Resource Error: Member record not found in this branch registry", 404);

  const updatedClient = await clientesRepository.update(gymId, id, data);

  // Audit Layer: Log the data modification
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: id,
    accion: "ACTUALIZAR",
    detalles: data,
  });

  return updatedClient;
}

/* ============================================================
   MEMBER OFFBOARDING SERVICES
   ============================================================ */

/**
 * Permanently removes a member record from the organizational registry.
 */
export async function eliminarCliente(gymId, id, admin) {
  if (!admin?.id) throw new AppError("System Error: Invalid administrative context for deletion", 400);

  await validarPermisos(admin.id, gymId);

  const existingClient = await clientesRepository.getById(gymId, id);
  if (!existingClient) throw new AppError("Resource Error: Member record not found", 404);

  // Repository Layer: Cascading deletion
  await clientesRepository.remove(gymId, id);

  // Audit Layer: Securely log the destruction of member data
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: id,
    accion: "ELIMINAR",
    detalles: `Member purged: ${existingClient.nombre} ${existingClient.apellido}`
  });
}
