import * as pagosRepository from './pagos.repository.js';
import { requireFields } from '../../utils/validators.js';
import { AppError } from '../../utils/AppError.js';
import { registrarOperacion } from '../audit/audit.service.js';
import * as authRepository from '../auth/auth.repository.js';

/**
 * Retrieves a filtered list of all payment records for a gym branch.
 * 
 * @param {number} gymId - The gym branch identifier.
 * @param {Object} filtros - Criteria for filtering (claseId, clienteId, date range).
 * @returns {Promise<Array>} Collection of payment records.
 */
export async function listarPagos(gymId, filtros) {
  return pagosRepository.findByGym(gymId, filtros);
}

/**
 * Retrieves a list of outstanding (unpaid) obligations for a gym branch.
 * Specifically used for high-priority dashboard monitoring.
 * 
 * @param {number} gymId - The gym branch identifier.
 * @param {Object} filtros - Criteria for filtering.
 * @returns {Promise<Array>} Collection of pending payment records.
 */
export async function listarPagosPendientes(gymId, filtros) {
  return pagosRepository.findPagnosPendientes(gymId, filtros);
}

/**
 * Retrieves the real-time payment status of all students enrolled in a specific class.
 * Useful for monthly checklist and quick collections at the reception desk.
 * 
 * @param {number} gymId - The gym branch identifier.
 * @param {number} claseId - The target class/discipline.
 * @param {string} mes - The target month in 'YYYY-MM' format.
 * @returns {Promise<Array>} Checklist of student payment states.
 */
export async function getEstadoPagosClase(gymId, claseId, mes) {
  return pagosRepository.getEstadoPagosClase(gymId, claseId, mes);
}

/**
 * Orchestrates the creation of a new payment record.
 * Automatically synchronizes with the 'Economy' module to record revenue if paid.
 * 
 * @param {number} gymId - The gym branch context.
 * @param {Object} data - Payment details (client, amount, date, method).
 * @param {Object} admin - Identity of the collecting administrator.
 * @returns {Promise<Object>} The persisted payment record.
 */
export async function crearPago(gymId, data, admin) {
  requireFields(data, ['cliente_id', 'importe', 'fecha_pago']);

  if (!admin?.id) {
    throw new AppError('Invalid administrator context for payment registration', 400);
  }

  // Security Guard: Ensure the administrator has authority over the branch
  const gyms = await authRepository.getGymsByAdminId(admin.id);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError('Access Denied: You do not have permission to operate in this gym branch', 403);
  }

  // The repository handles atomic transaction: Payment Record + Economy Income Entry
  const pago = await pagosRepository.createPago(gymId, data, admin.id);

  // Audit: Track the financial collection event
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: 'PAGO',
    entidadId: pago.id,
    accion: 'CREAR',
    detalles: data
  });

  return pago;
}

/**
 * Updates an existing payment record's details.
 * If the status changes from 'pending' to 'paid', it automatically triggers a revenue entry.
 * 
 * @param {number} gymId - The gym branch context.
 * @param {number} id - Target payment record ID.
 * @param {Object} data - Updated attributes.
 * @param {Object} admin - Identity of the performing administrator.
 * @returns {Promise<Object>} The updated payment record.
 */
export async function actualizarPago(gymId, id, data, admin) {
  if (!admin?.id) {
    throw new AppError('Invalid administrator context for update', 400);
  }

  // Security Guard: Verify branch management rights
  const gyms = await authRepository.getGymsByAdminId(admin.id);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError('Access Denied: You do not have permission to operate in this gym branch', 403);
  }

  const pagoAntes = await pagosRepository.getById(gymId, id);
  if (!pagoAntes) throw new AppError('Payment record not found', 404);

  // The repository handles atomic transition: Status Update + Conditional Revenue Logging
  const pago = await pagosRepository.updatePago(gymId, id, data, admin.id);

  // Audit: Track the modification of financial records
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: 'PAGO',
    entidadId: id,
    accion: 'ACTUALIZAR',
    detalles: data
  });

  return pago;
}
