import * as productosRepository from './productos.repository.js';
import * as economiaRepository from '../economia/economia.repository.js';
import * as authRepository from '../auth/auth.repository.js';
import { registrarOperacion } from '../audit/audit.service.js';
import { requireFields } from '../../utils/validators.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Validates that an administrator has authority to manage inventory within a specific gym branch.
 * @param {number} adminId - The administrator's unique identifier.
 * @param {number} gymId - The target gym branch identifier.
 * @throws {AppError} 403 if permission is denied.
 */
async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError('Access Denied: You do not have permission to manage inventory in this branch', 403);
  }
}

/**
 * Retrieves the full product catalog for a specific gym branch.
 * @param {number} gymId - The target branch identifier.
 * @returns {Promise<Array>} Collection of product entities.
 */
export async function listarProductos(gymId) {
  return productosRepository.findByGym(gymId);
}

/**
 * Retrieves historical inventory movements (Purchases and Sales) for a branch.
 * Supports granular filtering via query parameters.
 * @param {number} gymId - The branch identifier.
 * @param {Object} filtros - Criteria for filtering movements.
 */
export async function listarMovimientos(gymId, filtros) {
  return productosRepository.findMovimientosByGym(gymId, filtros);
}

/**
 * Aggregates financial performance statistics for the product catalog.
 * Breaks down revenue and costs on a per-product basis.
 * @param {number} gymId - The branch identifier.
 */
export async function estadisticasProductos(gymId) {
  const [ingresos, gastos] = await Promise.all([
    productosRepository.statsIngresosPorProducto(gymId),
    productosRepository.statsGastosPorProducto(gymId),
  ]);

  return { ingresos, gastos };
}

/**
 * Creates a new base product definition in the catalog.
 * @param {number} gymId - Target branch for the product.
 * @param {Object} data - Product properties (branding, default pricing).
 * @param {Object} admin - Identity of the performing administrator.
 */
export async function crearProductoBase(gymId, data, admin) {
  requireFields(data, ['nombre', 'precio_unitario']);

  if (!admin?.id) throw new AppError('Invalid administrator context', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.createProducto(gymId, data);

  // Audit: Track catalog expansion
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: 'PRODUCTO',
    entidadId: producto.id,
    accion: 'CREAR',
    detalles: data
  });

  return producto;
}

/**
 * Updates an existing product definition.
 * @param {number} gymId - Branch context.
 * @param {number} id - Target product ID.
 * @param {Object} data - Attributes to modify.
 */
export async function actualizarProducto(gymId, id, data, admin) {
  if (!admin?.id) throw new AppError('Invalid administrator context', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.getProductoById(gymId, id);
  if (!producto) throw new AppError('Resource Error: Product not found', 404);

  const actualizado = await productosRepository.updateProducto(gymId, id, data);

  // Audit: Track catalog modification
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: 'PRODUCTO',
    entidadId: id,
    accion: 'ACTUALIZAR',
    detalles: data
  });

  return actualizado;
}

/**
 * Orchestrates an inventory replenishment (Purchase) transaction.
 * Synchronizes stock levels and automatically records an operational expense.
 * 
 * @param {number} gymId - Branch context.
 * @param {number} productoId - Target product for replenishment.
 * @param {Object} data - Transaction details (quantity, cost).
 */
export async function registrarCompra(gymId, productoId, data, admin) {
  requireFields(data, ['cantidad', 'precio_unitario']);

  if (!admin?.id) throw new AppError('Invalid administrator context', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.getProductoById(gymId, productoId);
  if (!producto) throw new AppError('Resource Error: Product not found', 404);

  // Transaction Layer: Update physical stock and log inventory movement
  const { movimiento, producto: productoActualizado } =
    await productosRepository.registrarMovimiento(gymId, productoId, {
      tipo_movimiento: 'COMPRA',
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      adminId: admin.id,
    });

  // Financial Integration: Record the capital outflow in the 'Economy' ledger
  await economiaRepository.insertGasto({
    gymId,
    fuente_tipo: 'PRODUCTO_COMPRA',
    fuente_id: movimiento.id,
    descripcion: `Inventory Replenishment: ${producto.nombre}`,
    importe: data.cantidad * data.precio_unitario,
    adminId: admin.id,
  });

  // Audit: Track inventory acquisition
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: 'PRODUCTO',
    entidadId: productoId,
    accion: 'COMPRA',
    detalles: data
  });

  return { movimiento, producto: productoActualizado };
}

/**
 * Orchestrates an inventory depletion (Sale) transaction.
 * Synchronizes stock levels and automatically records operational revenue.
 * 
 * @param {number} gymId - Branch context.
 * @param {number} productoId - Product sold.
 * @param {Object} data - Transaction details (quantity, selling price).
 */
export async function registrarVenta(gymId, productoId, data, admin) {
  requireFields(data, ['cantidad', 'precio_unitario']);

  if (!admin?.id) throw new AppError('Invalid administrator context', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.getProductoById(gymId, productoId);
  if (!producto) throw new AppError('Resource Error: Product not found', 404);

  // Transaction Layer: Deduct physical stock and log inventory movement
  const { movimiento, producto: productoActualizado } =
    await productosRepository.registrarMovimiento(gymId, productoId, {
      tipo_movimiento: 'VENTA',
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      adminId: admin.id,
    });

  // Financial Integration: Record the capital inflow in the 'Economy' ledger
  await economiaRepository.insertIngreso({
    gymId,
    fuente_tipo: 'PRODUCTO_VENTA',
    fuente_id: movimiento.id,
    descripcion: `Inventory Sale: ${producto.nombre}`,
    importe: data.cantidad * data.precio_unitario,
    adminId: admin.id,
  });

  // Audit: Track inventory revenue event
  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: 'PRODUCTO',
    entidadId: productoId,
    accion: 'VENTA',
    detalles: data
  });

  return { movimiento, producto: productoActualizado };
}
