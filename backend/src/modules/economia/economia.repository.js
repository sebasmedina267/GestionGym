import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   FINANCIAL AGGREGATION QUERIES
   ============================================================ */

/**
 * Calculates the total revenue for a specific branch and time range.
 * @param {number} gymId - Target branch.
 * @param {Object} range - Filtering dates ({ desde, hasta }).
 * @returns {Promise<number>} Total revenue amount.
 */
export async function totalIngresos(gymId, { desde, hasta }) {
  let query = "SELECT SUM(importe) AS total FROM ingresos WHERE gym_id = ?";
  const params = [gymId];

  if (desde) {
    query += " AND fecha >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND fecha <= ?";
    params.push(hasta);
  }

  const [rows] = await pool.query(query, params);
  return Number(rows[0].total || 0);
}

/**
 * Calculates the total expenses for a specific branch and time range.
 * @param {number} gymId - Target branch.
 * @param {Object} range - Filtering dates ({ desde, hasta }).
 * @returns {Promise<number>} Total expense amount.
 */
export async function totalGastos(gymId, { desde, hasta }) {
  let query = "SELECT SUM(importe) AS total FROM gastos WHERE gym_id = ?";
  const params = [gymId];

  if (desde) {
    query += " AND fecha >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND fecha <= ?";
    params.push(hasta);
  }

  const [rows] = await pool.query(query, params);
  return Number(rows[0].total || 0);
}

/* ============================================================
   DATA PERSISTENCE: INCOME
   ============================================================ */

/**
 * Persists a new income record within a transaction.
 * @param {Object} data - Record details including gymId, type, amount, etc.
 * @returns {Promise<Object>} The newly created record.
 */
export async function insertIngreso({
  gymId,
  fuente_tipo,
  fuente_id,
  descripcion,
  importe,
  fecha,
  adminId,
}) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Data Integrity Validation
    if (!descripcion) throw new AppError("Transaction description is required", 400);
    if (!importe || importe <= 0)
      throw new AppError("Transaction amount must be a positive number", 400);

    const [result] = await conn.query(
      `INSERT INTO ingresos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        fuente_tipo || "MANUAL",
        fuente_id || null,
        descripcion,
        importe,
        fecha || new Date(),
        adminId || null,
      ],
    );

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM ingresos WHERE id = ?", [
      result.insertId,
    ]);
    return rows[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* ============================================================
   DATA PERSISTENCE: EXPENSES
   ============================================================ */

/**
 * Persists a new expense record within a transaction.
 * @param {Object} data - Record details.
 * @returns {Promise<Object>} The newly created record.
 */
export async function insertGasto({
  gymId,
  fuente_tipo,
  fuente_id,
  descripcion,
  importe,
  fecha,
  adminId,
}) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Data Integrity Validation
    if (!descripcion) throw new AppError("Expense description is required", 400);
    if (!importe || importe <= 0)
      throw new AppError("Expense amount must be a positive number", 400);

    const [result] = await conn.query(
      `INSERT INTO gastos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        fuente_tipo || "MANUAL",
        fuente_id || null,
        descripcion,
        importe,
        fecha || new Date(),
        adminId || null,
      ],
    );

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM gastos WHERE id = ?", [
      result.insertId,
    ]);
    return rows[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* ============================================================
   HISTORICAL LISTING QUERIES
   ============================================================ */

/** Retrieves a list of income records sorted by date. */
export async function listIngresos(gymId, { desde, hasta } = {}) {
  let query = "SELECT * FROM ingresos WHERE gym_id = ?";
  const params = [gymId];

  if (desde) {
    query += " AND fecha >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND fecha <= ?";
    params.push(hasta);
  }

  query += " ORDER BY fecha DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

/** Retrieves a list of expense records sorted by date. */
export async function listGastos(gymId, { desde, hasta } = {}) {
  let query = "SELECT * FROM gastos WHERE gym_id = ?";
  const params = [gymId];

  if (desde) {
    query += " AND fecha >= ?";
    params.push(desde);
  }
  if (hasta) {
    query += " AND fecha <= ?";
    params.push(hasta);
  }

  query += " ORDER BY fecha DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

/* ============================================================
   CHRONOLOGICAL ANALYTICS QUERIES
   ============================================================ */

/** 
 * Groups income by the requested time period.
 * Supports daily, monthly, and yearly aggregation.
 */
export async function ingresosPorPeriodo(gymId, periodo) {
  let groupBy = "";

  switch (periodo) {
    case "dia":
      groupBy = "DATE(fecha)";
      break;
    case "mes":
      groupBy = "YEAR(fecha), MONTH(fecha)";
      break;
    case "anio":
      groupBy = "YEAR(fecha)";
      break;
    default:
      throw new AppError("Invalid analytics period", 400);
  }

  const [rows] = await pool.query(
    `SELECT ${groupBy} AS periodo, SUM(importe) AS total
     FROM ingresos
     WHERE gym_id = ?
     GROUP BY ${groupBy}
     ORDER BY periodo ASC`,
    [gymId],
  );

  return rows;
}

/** 
 * Groups expenses by the requested time period.
 */
export async function gastosPorPeriodo(gymId, periodo) {
  let groupBy = "";

  switch (periodo) {
    case "dia":
      groupBy = "DATE(fecha)";
      break;
    case "mes":
      groupBy = "YEAR(fecha), MONTH(fecha)";
      break;
    case "anio":
      groupBy = "YEAR(fecha)";
      break;
    default:
      throw new AppError("Invalid analytics period", 400);
  }

  const [rows] = await pool.query(
    `SELECT ${groupBy} AS periodo, SUM(importe) AS total
     FROM gastos
     WHERE gym_id = ?
     GROUP BY ${groupBy}
     ORDER BY periodo ASC`,
    [gymId],
  );

  return rows;
}
