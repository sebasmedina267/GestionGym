import * as pagosRepository from './pagos.repository.js';
import { requireFields } from '../../utils/validators.js';
import { AppError } from '../../utils/AppError.js';
import { registrarOperacion } from '../audit/audit.service.js';
import * as authRepository from '../auth/auth.repository.js';

/**
 * LISTAR PAGOS
 */
export async function listarPagos(gymId, filtros) {
  return pagosRepository.findByGym(gymId, filtros);
}

/**
 * LISTAR PAGOS PENDIENTES (PARA DASHBOARD)
 */
export async function listarPagosPendientes(gymId, filtros) {
  return pagosRepository.findPagnosPendientes(gymId, filtros);
}

export async function getEstadoPagosClase(gymId, claseId, mes) {
  return pagosRepository.getEstadoPagosClase(gymId, claseId, mes);
}

/**
 * CREAR PAGO
 */
export async function crearPago(gymId, data, admin) {
  requireFields(data, ['cliente_id', 'importe', 'fecha_pago']);

  if (!admin?.id) {
    throw new AppError('Admin inválido para registrar pago', 400);
  }

  // Validar que el admin pertenece al gym
  const gyms = await authRepository.getGymsByAdminId(admin.id);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError('No tienes permiso para operar en este gym', 403);
  }

  // El repositorio YA registra el ingreso si pagado = true
  const pago = await pagosRepository.createPago(gymId, data, admin.id);

  // Auditoría
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
 * ACTUALIZAR PAGO
 */
export async function actualizarPago(gymId, id, data, admin) {
  if (!admin?.id) {
    throw new AppError('Admin inválido para actualizar pago', 400);
  }

  // Validar que el admin pertenece al gym
  const gyms = await authRepository.getGymsByAdminId(admin.id);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError('No tienes permiso para operar en este gym', 403);
  }

  const pagoAntes = await pagosRepository.getById(gymId, id);
  if (!pagoAntes) throw new AppError('Pago no encontrado', 404);

  // El repositorio YA registra el ingreso si cambia de no pagado → pagado
  const pago = await pagosRepository.updatePago(gymId, id, data, admin.id);

  // Auditoría
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
