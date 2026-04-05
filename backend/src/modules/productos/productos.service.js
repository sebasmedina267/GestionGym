import * as productosRepository from './productos.repository.js';
import * as economiaRepository from '../economia/economia.repository.js';
import * as authRepository from '../auth/auth.repository.js';
import { registrarOperacion } from '../audit/audit.service.js';
import { requireFields } from '../../utils/validators.js';
import { AppError } from '../../utils/AppError.js';

/**
 * VALIDAR PERMISOS DEL ADMIN
 */
async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some(g => g.id === gymId)) {
    throw new AppError('No tienes permiso para operar en este gym', 403);
  }
}

/**
 * LISTAR PRODUCTOS DEL GYM
 */
export async function listarProductos(gymId) {
  return productosRepository.findByGym(gymId);
}

/**
 * LISTAR MOVIMIENTOS
 */
export async function listarMovimientos(gymId, filtros) {
  return productosRepository.findMovimientosByGym(gymId, filtros);
}

/**
 * ESTADÍSTICAS
 */
export async function estadisticasProductos(gymId) {
  const [ingresos, gastos] = await Promise.all([
    productosRepository.statsIngresosPorProducto(gymId),
    productosRepository.statsGastosPorProducto(gymId),
  ]);

  return { ingresos, gastos };
}

/**
 * CREAR PRODUCTO BASE
 */
export async function crearProductoBase(gymId, data, admin) {
  requireFields(data, ['nombre', 'precio_unitario']);

  if (!admin?.id) throw new AppError('Admin inválido', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.createProducto(gymId, data);

  // Auditoría
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
 * ACTUALIZAR PRODUCTO
 */
export async function actualizarProducto(gymId, id, data, admin) {
  if (!admin?.id) throw new AppError('Admin inválido', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.getProductoById(gymId, id);
  if (!producto) throw new AppError('Producto no encontrado', 404);

  const actualizado = await productosRepository.updateProducto(gymId, id, data);

  // Auditoría
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
 * REGISTRAR COMPRA
 */
export async function registrarCompra(gymId, productoId, data, admin) {
  requireFields(data, ['cantidad', 'precio_unitario']);

  if (!admin?.id) throw new AppError('Admin inválido', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.getProductoById(gymId, productoId);
  if (!producto) throw new AppError('Producto no encontrado', 404);

  // Movimiento + producto actualizado
  const { movimiento, producto: productoActualizado } =
    await productosRepository.registrarMovimiento(gymId, productoId, {
      tipo_movimiento: 'COMPRA',
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      adminId: admin.id,
    });

  // Registrar gasto económico
  await economiaRepository.insertGasto({
    gymId,
    fuente_tipo: 'PRODUCTO_COMPRA',
    fuente_id: movimiento.id,
    descripcion: `Compra producto ${producto.nombre}`,
    importe: data.cantidad * data.precio_unitario,
    adminId: admin.id,
  });

  // Auditoría
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
 * REGISTRAR VENTA
 */
export async function registrarVenta(gymId, productoId, data, admin) {
  requireFields(data, ['cantidad', 'precio_unitario']);

  if (!admin?.id) throw new AppError('Admin inválido', 400);

  await validarPermisos(admin.id, gymId);

  const producto = await productosRepository.getProductoById(gymId, productoId);
  if (!producto) throw new AppError('Producto no encontrado', 404);

  const { movimiento, producto: productoActualizado } =
    await productosRepository.registrarMovimiento(gymId, productoId, {
      tipo_movimiento: 'VENTA',
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      adminId: admin.id,
    });

  // Registrar ingreso económico
  await economiaRepository.insertIngreso({
    gymId,
    fuente_tipo: 'PRODUCTO_VENTA',
    fuente_id: movimiento.id,
    descripcion: `Venta producto ${producto.nombre}`,
    importe: data.cantidad * data.precio_unitario,
    adminId: admin.id,
  });

  // Auditoría
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
