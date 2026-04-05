import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/**
 * LISTAR PAGOS DEL GYM
 */
export async function findByGym(
  gymId,
  { claseId, clienteId, desde, hasta } = {},
) {
  let query = `
    SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, cl.nombre AS clase_nombre
    FROM pagos p
    JOIN clientes c ON c.id = p.cliente_id
    LEFT JOIN clases cl ON cl.id = p.clase_id
    WHERE p.gym_id = ?`;
  const params = [gymId];

  if (claseId) {
    query += " AND p.clase_id = ?";
    params.push(claseId);
  }
  if (clienteId) {
    query += " AND p.cliente_id = ?";
    params.push(clienteId);
  }
  if (desde) {
    query += " AND p.fecha_pago >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND p.fecha_pago <= ?";
    params.push(hasta);
  }

  query += " ORDER BY p.fecha_pago DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * LISTAR PAGOS PENDIENTES DEL GYM
 */
export async function findPagnosPendientes(gymId, { claseId, clienteId, desde, hasta } = {}) {
  let query = `
    SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, cl.nombre AS clase_nombre
    FROM pagos p
    JOIN clientes c ON c.id = p.cliente_id
    LEFT JOIN clases cl ON cl.id = p.clase_id
    WHERE p.gym_id = ? AND p.pagado = FALSE`;
  const params = [gymId];

  if (claseId) {
    query += " AND p.clase_id = ?";
    params.push(claseId);
  }
  if (clienteId) {
    query += " AND p.cliente_id = ?";
    params.push(clienteId);
  }
  if (desde) {
    query += " AND p.fecha_pago >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND p.fecha_pago <= ?";
    params.push(hasta);
  }

  query += " ORDER BY p.fecha_pago ASC";

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * ESTADO DE PAGOS POR CLASE (CHECKLIST)
 */
export async function getEstadoPagosClase(gymId, claseId, mes) {
  // mes format: 'YYYY-MM'
  const query = `
    SELECT DISTINCT 
      c.id AS cliente_id,
      c.nombre AS cliente_nombre,
      c.apellido AS cliente_apellido,
      p.id AS pago_id,
      p.pagado,
      p.importe,
      p.fecha_pago,
      p.metodo_pago
    FROM clientes_clases cc
    JOIN clientes c ON c.id = cc.cliente_id
    JOIN clases_horarios ch ON ch.id = cc.clase_horario_id
    LEFT JOIN pagos p ON p.cliente_id = c.id 
      AND p.clase_id = ch.clase_id 
      AND DATE_FORMAT(p.fecha_pago, '%Y-%m') = ? 
      AND p.gym_id = ?
    WHERE ch.clase_id = ? AND c.gym_id = ? AND c.activo = 1
    ORDER BY c.nombre ASC`;
    
  const [rows] = await pool.query(query, [mes, gymId, claseId, gymId]);
  return rows;
}

/**
 * CREA PAGO + INGRESO ECONÓMICO EN UNA SOLA TRANSACCIÓN
 */
export async function createPago(gymId, data, adminId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      cliente_id,
      precio_id = null,
      clase_id = null,
      pagado = true,
      importe,
      fecha_pago,
      periodo_inicio = null,
      periodo_fin = null,
      metodo_pago = 'EFECTIVO',
    } = data;

    // Validar cliente pertenece al gym
    const [clienteRows] = await conn.query(
      "SELECT id FROM clientes WHERE id = ? AND gym_id = ?",
      [cliente_id, gymId],
    );
    if (!clienteRows[0])
      throw new AppError("Cliente no pertenece a este gym", 400);

    // Crear pago (ahora incluye gym_id y metodo_pago)
    const [pagoResult] = await conn.query(
      `INSERT INTO pagos (gym_id, cliente_id, precio_id, clase_id, pagado, importe, fecha_pago, periodo_inicio, periodo_fin, metodo_pago)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        cliente_id,
        precio_id,
        clase_id,
        pagado,
        importe,
        fecha_pago,
        periodo_inicio,
        periodo_fin,
        metodo_pago,
      ],
    );

    const pagoId = pagoResult.insertId;

    // Si está pagado → registrar ingreso económico
    if (pagado) {
      await conn.query(
        `INSERT INTO ingresos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
         VALUES (?, 'PAGO_CLIENTE', ?, ?, ?, ?, ?)`,
        [
          gymId,
          pagoId,
          `Pago cliente ${cliente_id}`,
          importe,
          fecha_pago,
          adminId,
        ],
      );
    }

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM pagos WHERE id = ?", [
      pagoId,
    ]);
    return rows[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * OBTENER PAGO POR ID (VALIDANDO GYM)
 */
export async function getById(gymId, id) {
  const [rows] = await pool.query(
    `SELECT *
     FROM pagos
     WHERE id = ? AND gym_id = ?`,
    [id, gymId],
  );
  return rows[0];
}

/**
 * ACTUALIZACIÓN DE PAGO + INGRESO (si cambia pagado)
 */
export async function updatePago(gymId, id, data, adminId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const pagoActual = await getById(gymId, id);
    if (!pagoActual) throw new AppError("Pago no encontrado", 404);

    const fields = [];
    const values = [];

    [
      "precio_id",
      "clase_id",
      "pagado",
      "importe",
      "fecha_pago",
      "periodo_inicio",
      "periodo_fin",
      "metodo_pago",
    ].forEach((field) => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (fields.length) {
      values.push(id, gymId);

      await conn.query(
        `UPDATE pagos
         SET ${fields.join(", ")}
         WHERE id = ? AND gym_id = ?`,
        values,
      );
    }

    // Si antes no estaba pagado y ahora sí → crear ingreso
    if (!pagoActual.pagado && data.pagado === true) {
      await conn.query(
        `INSERT INTO ingresos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
         VALUES (?, 'PAGO_CLIENTE', ?, ?, ?, ?, ?)`,
        [
          gymId,
          id,
          `Pago cliente ${pagoActual.cliente_id}`,
          data.importe ?? pagoActual.importe,
          data.fecha_pago ?? pagoActual.fecha_pago,
          adminId,
        ],
      );
    }

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM pagos WHERE id = ?", [id]);
    return rows[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
