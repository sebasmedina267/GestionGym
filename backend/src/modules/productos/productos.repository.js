import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/**
 * LISTAR PRODUCTOS DEL GYM
 */
export async function findByGym(gymId) {
  const [rows] = await pool.query(
    `SELECT p.*,
            (p.precio_unitario * p.cantidad) AS valor_total
     FROM productos p
     WHERE p.gym_id = ?`,
    [gymId],
  );
  return rows;
}

/**
 * CREAR PRODUCTO
 */
export async function createProducto(gymId, data) {
  const {
    nombre,
    descripcion = null,
    precio_unitario,
    cantidad = 0,
    foto = null,
  } = data;

  if (precio_unitario < 0)
    throw new AppError("El precio no puede ser negativo", 400);

  if (cantidad < 0)
    throw new AppError("La cantidad no puede ser negativa", 400);

  // 🔥 VALIDACIÓN DUPLICADO
  const [existente] = await pool.query(
    "SELECT id FROM productos WHERE gym_id = ? AND nombre = ?",
    [gymId, nombre]
  );

  if (existente.length > 0) {
    throw new AppError("Ya existe un producto con ese nombre", 400);
  }

  const [result] = await pool.query(
    `INSERT INTO productos (gym_id, nombre, descripcion, precio_unitario, cantidad, foto)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gymId, nombre, descripcion, precio_unitario, cantidad, foto]
  );

  return getProductoById(gymId, result.insertId);
}

/**
 * ACTUALIZAR PRODUCTO
 */
export async function updateProducto(gymId, id, data) {
  const producto = await getProductoById(gymId, id);
  if (!producto) throw new AppError("Producto no encontrado en este gym", 404);

  const fields = [];
  const values = [];

  ["nombre", "descripcion", "precio_unitario", "cantidad", "foto"].forEach(
    (field) => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    },
  );

  if (!fields.length) return producto;

  values.push(gymId, id);

  await pool.query(
    `UPDATE productos SET ${fields.join(", ")} WHERE gym_id = ? AND id = ?`,
    values,
  );

  return getProductoById(gymId, id);
}

/**
 * OBTENER PRODUCTO POR ID
 */
export async function getProductoById(gymId, id) {
  const [rows] = await pool.query(
    "SELECT * FROM productos WHERE gym_id = ? AND id = ?",
    [gymId, id],
  );
  return rows[0];
}

/**
 * REGISTRAR MOVIMIENTO (COMPRA, VENTA, AJUSTE)
 */
export async function registrarMovimiento(
  gymId,
  productoId,
  { tipo_movimiento, cantidad, precio_unitario, adminId },
) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Bloquear producto
    const [prodRows] = await conn.query(
      "SELECT * FROM productos WHERE id = ? AND gym_id = ? FOR UPDATE",
      [productoId, gymId],
    );

    const producto = prodRows[0];
    if (!producto)
      throw new AppError("Producto no encontrado en este gym", 404);

    // Validación de stock
    if (tipo_movimiento === "VENTA" && producto.cantidad < cantidad) {
      throw new AppError("Stock insuficiente para la venta", 400);
    }

    // Registrar movimiento
    const [result] = await conn.query(
      `INSERT INTO productos_movimientos (producto_id, tipo_movimiento, cantidad, precio_unitario, admin_id)
       VALUES (?, ?, ?, ?, ?)`,
      [productoId, tipo_movimiento, cantidad, precio_unitario, adminId],
    );

    // Calcular nueva cantidad
    let nuevaCantidad = producto.cantidad;

    if (tipo_movimiento === "COMPRA") nuevaCantidad += cantidad;
    if (tipo_movimiento === "VENTA") nuevaCantidad -= cantidad;
    if (tipo_movimiento === "AJUSTE") nuevaCantidad = cantidad; // Ajuste directo

    // Actualizar stock (validando gym)
    await conn.query(
      "UPDATE productos SET cantidad = ? WHERE id = ? AND gym_id = ?",
      [nuevaCantidad, productoId, gymId],
    );

    await conn.commit();

    const [mov] = await conn.query(
      "SELECT * FROM productos_movimientos WHERE id = ?",
      [result.insertId],
    );

    const productoActualizado = await getProductoById(gymId, productoId);

    return {
      movimiento: mov[0],
      producto: productoActualizado,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * LISTAR MOVIMIENTOS DEL GYM
 */
export async function findMovimientosByGym(
  gymId,
  { desde, hasta, productoId },
) {
  let query = `
    SELECT m.*, p.nombre AS producto_nombre
    FROM productos_movimientos m
    JOIN productos p ON p.id = m.producto_id
    WHERE p.gym_id = ?`;
  const params = [gymId];

  if (productoId) {
    query += " AND p.id = ?";
    params.push(productoId);
  }
  if (desde) {
    query += " AND m.fecha >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND m.fecha <= ?";
    params.push(hasta);
  }

  query += " ORDER BY m.fecha DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * ESTADÍSTICAS DE INGRESOS POR PRODUCTO
 */
export async function statsIngresosPorProducto(gymId) {
  const [rows] = await pool.query(
    `SELECT p.id, p.nombre,
            SUM(m.cantidad * m.precio_unitario) AS total_ingresos
     FROM productos_movimientos m
     JOIN productos p ON p.id = m.producto_id
     WHERE p.gym_id = ? AND m.tipo_movimiento = 'VENTA'
     GROUP BY p.id, p.nombre`,
    [gymId],
  );
  return rows;
}

/**
 * ESTADÍSTICAS DE GASTOS POR PRODUCTO
 */
export async function statsGastosPorProducto(gymId) {
  const [rows] = await pool.query(
    `SELECT p.id, p.nombre,
            SUM(m.cantidad * m.precio_unitario) AS total_gastos
     FROM productos_movimientos m
     JOIN productos p ON p.id = m.producto_id
     WHERE p.gym_id = ? AND m.tipo_movimiento = 'COMPRA'
     GROUP BY p.id, p.nombre`,
    [gymId],
  );
  return rows;
}
