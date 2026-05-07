import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Retrieves a comprehensive list of payments for a gym branch.
 * Supports granular filtering by class, client, and chronological range.
 * 
 * @param {number} gymId - The target gym branch identifier.
 * @param {Object} filters - Search criteria (claseId, clienteId, desde, hasta).
 * @returns {Promise<Array>} List of payment records with joined client and class details.
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
 * Retrieves outstanding (unpaid) payment records for a gym branch.
 * Useful for desk debt collection and financial health monitoring.
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
 * Generates a real-time payment checklist for all active students in a specific class.
 * Cross-references enrollments with payment records for the specified month.
 * 
 * @param {number} gymId - The target branch.
 * @param {number} claseId - The target discipline.
 * @param {string} mes - Filter month (format 'YYYY-MM').
 * @returns {Promise<Array>} List of students with their respective payment status for the period.
 */
export async function getEstadoPagosClase(gymId, claseId, mes) {
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
 * Persists a new payment and atomically records a corresponding revenue entry if paid.
 * Orchestrated within a database transaction to ensure financial data integrity.
 * 
 * @param {number} gymId - Gym branch identifier.
 * @param {Object} data - Payment attributes (client, amount, dates, method).
 * @param {number} adminId - The performing administrator's ID.
 * @returns {Promise<Object>} The persisted payment record.
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

    // Security Check: Verify client exists within the specified branch scope
    const [clienteRows] = await conn.query(
      "SELECT id FROM clientes WHERE id = ? AND gym_id = ?",
      [cliente_id, gymId],
    );
    if (!clienteRows[0])
      throw new AppError("Integrity Error: Client does not belong to this gym branch", 400);

    // Persist Payment Entry
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

    // Financial Synchronization: Automatically record revenue if the transaction is settled
    if (pagado) {
      await conn.query(
        `INSERT INTO ingresos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
         VALUES (?, 'PAGO_CLIENTE', ?, ?, ?, ?, ?)`,
        [
          gymId,
          pagoId,
          `Payment from client ID ${cliente_id}`,
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

/** Retrieves a specific payment record by ID, scoped to a gym branch. */
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
 * Updates a payment record and handles conditional revenue synchronization.
 * If the status transitions to 'paid', an associated income record is created.
 * 
 * @param {number} gymId - Gym branch scope.
 * @param {number} id - Target payment record.
 * @param {Object} data - Updated fields.
 * @param {number} adminId - Performing admin.
 */
export async function updatePago(gymId, id, data, adminId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const pagoActual = await getById(gymId, id);
    if (!pagoActual) throw new AppError("Resource Error: Payment record not found", 404);

    const fields = [];
    const values = [];

    // Dynamic field mapping for partial updates
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

    // Revenue Trigger: Transition from 'unpaid' to 'paid' triggers an automatic economic income entry
    if (!pagoActual.pagado && data.pagado === true) {
      await conn.query(
        `INSERT INTO ingresos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
         VALUES (?, 'PAGO_CLIENTE', ?, ?, ?, ?, ?)`,
        [
          gymId,
          id,
          `Payment settlement for client ID ${pagoActual.cliente_id}`,
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
