import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   TOTALES
============================================================ */

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
   INSERTAR INGRESO
============================================================ */

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

    if (!descripcion) throw new AppError("Descripción requerida", 400);
    if (!importe || importe <= 0)
      throw new AppError("El importe debe ser positivo", 400);

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
   INSERTAR GASTO
============================================================ */

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

    if (!descripcion) throw new AppError("Descripción requerida", 400);
    if (!importe || importe <= 0)
      throw new AppError("El importe debe ser positivo", 400);

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
   LISTADOS
============================================================ */

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
   ESTADÍSTICAS POR PERIODO
============================================================ */

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
      throw new AppError("Periodo inválido", 400);
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
      throw new AppError("Periodo inválido", 400);
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
