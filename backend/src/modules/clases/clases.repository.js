import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   CLASS DEFINITIONS
   ============================================================ */

/** Retrieves all classes defined for a specific gym branch. */
export async function findByGym(gymId) {
  const [rows] = await pool.query("SELECT * FROM clases WHERE gym_id = ?", [
    gymId,
  ]);
  return rows;
}

/**
 * Persists a new class definition.
 * @returns {Promise<Object>} The newly created class record.
 */
export async function createClase(gymId, data) {
  const { nombre, descripcion = null } = data;

  const [result] = await pool.query(
    "INSERT INTO clases (gym_id, nombre, descripcion) VALUES (?, ?, ?)",
    [gymId, nombre, descripcion],
  );

  return getClaseById(gymId, result.insertId);
}

/**
 * Updates an existing class definition.
 * Performs dynamic field mapping to update only provided values.
 */
export async function updateClase(gymId, id, data) {
  const clase = await getClaseById(gymId, id);
  if (!clase) throw new AppError("Class not found", 404);

  const fields = [];
  const values = [];

  if (data.nombre !== undefined) {
    fields.push("nombre = ?");
    values.push(data.nombre);
  }
  if (data.descripcion !== undefined) {
    fields.push("descripcion = ?");
    values.push(data.descripcion);
  }

  if (!fields.length) return clase;

  values.push(gymId, id);

  await pool.query(
    `UPDATE clases SET ${fields.join(", ")} WHERE gym_id = ? AND id = ?`,
    values,
  );

  return getClaseById(gymId, id);
}

/** Retrieves a single class record by ID, scoped to a gym branch. */
export async function getClaseById(gymId, id) {
  const [rows] = await pool.query(
    "SELECT * FROM clases WHERE gym_id = ? AND id = ?",
    [gymId, id],
  );
  return rows[0];
}

/** Permanently deletes a class definition and its associated data. */
export async function deleteClase(gymId, id) {
  const clase = await getClaseById(gymId, id);
  if (!clase) throw new AppError("Class not found", 404);

  await pool.query("DELETE FROM clases WHERE gym_id = ? AND id = ?", [
    gymId,
    id,
  ]);
}

/* ============================================================
   INSTRUCTOR (MONITOR) ASSIGNMENTS
   ============================================================ */

/** Links an administrator as an instructor for a specific class type. */
export async function addMonitor(claseId, adminId) {
  await pool.query(
    `INSERT IGNORE INTO clases_monitores (clase_id, admin_id)
     VALUES (?, ?)`,
    [claseId, adminId],
  );
}

/** Unlinks an instructor from a class type. */
export async function removeMonitor(claseId, adminId) {
  await pool.query(
    `DELETE FROM clases_monitores WHERE clase_id = ? AND admin_id = ?`,
    [claseId, adminId],
  );
}

/** Retrieves all instructors assigned to a specific class type. */
export async function getMonitores(claseId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.nombre, a.apellido
     FROM clases_monitores cm
     JOIN admins a ON a.id = cm.admin_id
     WHERE cm.clase_id = ?`,
    [claseId],
  );
  return rows;
}

/* ============================================================
   PRICING OPTIONS
   ============================================================ */

/** Retrieves all active pricing tiers for a class. */
export async function getPrecios(claseId) {
  const [rows] = await pool.query(
    `SELECT * FROM precios WHERE clase_id = ? AND activo = TRUE`,
    [claseId],
  );
  return rows;
}

/** Creates a new pricing tier. */
export async function createPrecio(claseId, data) {
  const { nombre, tipo_unidad, cantidad_unidad = 1, precio } = data;

  const [result] = await pool.query(
    `INSERT INTO precios (clase_id, nombre, tipo_unidad, cantidad_unidad, precio)
     VALUES (?, ?, ?, ?, ?)`,
    [claseId, nombre, tipo_unidad, cantidad_unidad, precio],
  );

  return getPrecioById(result.insertId);
}

/** Updates a pricing tier's attributes. */
export async function updatePrecio(id, data) {
  const fields = [];
  const values = [];

  ["nombre", "tipo_unidad", "cantidad_unidad", "precio", "activo"].forEach(
    (f) => {
      if (data[f] !== undefined) {
        fields.push(`${f} = ?`);
        values.push(data[f]);
      }
    },
  );

  if (!fields.length) return getPrecioById(id);

  values.push(id);

  await pool.query(
    `UPDATE precios SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );

  return getPrecioById(id);
}

/** Retrieves a specific pricing tier by ID. */
export async function getPrecioById(id) {
  const [rows] = await pool.query(`SELECT * FROM precios WHERE id = ?`, [id]);
  return rows[0];
}

/* ============================================================
   SCHEDULING (TIME SLOTS)
   ============================================================ */

/** Retrieves the weekly schedule for a class. */
export async function findHorariosByClase(gymId, claseId) {
  const [rows] = await pool.query(
    `SELECT h.*
     FROM clases_horarios h
     JOIN clases c ON c.id = h.clase_id
     WHERE c.gym_id = ? AND c.id = ?`,
    [gymId, claseId],
  );
  return rows;
}

/**
 * Creates a new scheduled session. 
 * Includes logic to prevent overlapping sessions for the same class.
 */
export async function createHorario(gymId, claseId, data) {
  const { inicio, fin, aforo_maximo = null } = data;

  const clase = await getClaseById(gymId, claseId);
  if (!clase) throw new AppError("Class not found", 404);

  // Integrity Check: Prevent overlapping sessions for the same class type
  const [solapados] = await pool.query(
    `SELECT *
     FROM clases_horarios
     WHERE clase_id = ?
       AND (
         (inicio <= ? AND fin > ?) OR
         (inicio < ? AND fin >= ?)
       )`,
    [claseId, inicio, inicio, fin, fin],
  );

  if (solapados.length > 0) {
    throw new AppError("This schedule overlaps with an existing session", 400);
  }

  const [result] = await pool.query(
    "INSERT INTO clases_horarios (clase_id, inicio, fin, aforo_maximo) VALUES (?, ?, ?, ?)",
    [claseId, inicio, fin, aforo_maximo],
  );

  return getHorarioById(result.insertId);
}

/** Retrieves a specific session entry by ID. */
export async function getHorarioById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM clases_horarios WHERE id = ?`,
    [id],
  );
  return rows[0];
}

/** Removes a session from the schedule, ensuring gym scoping. */
export async function deleteHorario(gymId, horarioId) {
  const [rows] = await pool.query(
    `SELECT h.*
     FROM clases_horarios h
     JOIN clases c ON c.id = h.clase_id
     WHERE h.id = ? AND c.gym_id = ?`,
    [horarioId, gymId],
  );

  if (!rows[0]) throw new AppError("Schedule entry not found", 404);

  await pool.query(
    `DELETE h FROM clases_horarios h
     JOIN clases c ON c.id = h.clase_id
     WHERE h.id = ? AND c.gym_id = ?`,
    [horarioId, gymId],
  );
}

/* ============================================================
   CLIENT ENROLLMENTS
   ============================================================ */

/** Retrieves all clients currently checked-in/enrolled in a specific session. */
export async function getClientesByHorario(gymId, horarioId) {
  const [rows] = await pool.query(
    `SELECT cl.*
     FROM clientes_clases cc
     JOIN clientes cl ON cl.id = cc.cliente_id
     WHERE cc.clase_horario_id = ? AND cl.gym_id = ?`,
    [horarioId, gymId]
  );
  return rows;
}

/**
 * Enrolls a client in a session. 
 * Performs checks for gym scoping, duplicates, and occupancy limits (Aforo).
 */
export async function inscribirClienteEnHorario(gymId, horarioId, clienteId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Verify client exists within the current gym branch
    const [clienteRows] = await conn.query(
      "SELECT * FROM clientes WHERE id = ? AND gym_id = ?",
      [clienteId, gymId],
    );
    if (!clienteRows[0])
      throw new AppError("Client not found in this gym branch", 404);

    // Verify schedule entry exists within the current gym branch
    const [horarioRows] = await conn.query(
      `SELECT h.*, c.gym_id
       FROM clases_horarios h
       JOIN clases c ON c.id = h.clase_id
       WHERE h.id = ? AND c.gym_id = ?`,
      [horarioId, gymId],
    );
    const horario = horarioRows[0];
    if (!horario) throw new AppError("Schedule entry not found in this gym branch", 404);

    // Prevent duplicate enrollments for the same session
    const [dup] = await conn.query(
      `SELECT * FROM clientes_clases
       WHERE cliente_id = ? AND clase_horario_id = ?`,
      [clienteId, horarioId],
    );
    if (dup.length > 0) throw new AppError("Client is already enrolled in this session", 400);

    // Enforce occupancy limits (Aforo)
    if (horario.aforo_maximo) {
      const [countRows] = await conn.query(
        "SELECT COUNT(*) AS inscritos FROM clientes_clases WHERE clase_horario_id = ?",
        [horarioId],
      );

      if (countRows[0].inscritos >= horario.aforo_maximo) {
        throw new AppError("Class occupancy limit reached (Aforo full)", 400);
      }
    }

    await conn.query(
      "INSERT INTO clientes_clases (cliente_id, clase_horario_id) VALUES (?, ?)",
      [clienteId, horarioId],
    );

    await conn.commit();

    return { cliente_id: clienteId, clase_horario_id: horarioId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Removes a client enrollment from a specific session. */
export async function desinscribirClienteDeHorario(
  gymId,
  horarioId,
  clienteId,
) {
  const [rows] = await pool.query(
    `SELECT cc.*
     FROM clientes_clases cc
     JOIN clases_horarios h ON h.id = cc.clase_horario_id
     JOIN clases c ON c.id = h.clase_id
     JOIN clientes cl ON cl.id = cc.cliente_id
     WHERE cc.cliente_id = ? AND cc.clase_horario_id = ? AND c.gym_id = ? AND cl.gym_id = ?`,
    [clienteId, horarioId, gymId, gymId],
  );

  if (!rows[0]) throw new AppError("Enrollment record not found", 404);

  await pool.query(
    `DELETE cc FROM clientes_clases cc
     JOIN clases_horarios h ON h.id = cc.clase_horario_id
     JOIN clases c ON c.id = h.clase_id
     JOIN clientes cl ON cl.id = cc.cliente_id
     WHERE cc.cliente_id = ? AND cc.clase_horario_id = ? AND c.gym_id = ? AND cl.gym_id = ?`,
    [clienteId, horarioId, gymId, gymId],
  );
}

/* ============================================================
   STATISTICAL ANALYSIS
   ============================================================ */

/** Demographic Breakdown: Gender distribution for a specific class. */
export async function statsGeneroClase(gymId, claseId) {
  const [rows] = await pool.query(
    `SELECT cl.sexo, COUNT(*) AS total
     FROM clientes_clases cc
     JOIN clases_horarios h ON h.id = cc.clase_horario_id
     JOIN clases c ON c.id = h.clase_id
     JOIN clientes cl ON cl.id = cc.cliente_id
     WHERE c.gym_id = ? AND c.id = ?
     GROUP BY cl.sexo`,
    [gymId, claseId],
  );
  return rows;
}

/** Demographic Breakdown: Age group distribution for a specific class. */
export async function statsEdadClase(gymId, claseId) {
  const [rows] = await pool.query(
    `SELECT 
       CASE 
         WHEN cl.edad < 18 THEN '<18'
         WHEN cl.edad BETWEEN 18 AND 25 THEN '18-25'
         WHEN cl.edad BETWEEN 26 AND 35 THEN '26-35'
         WHEN cl.edad BETWEEN 36 AND 50 THEN '36-50'
         ELSE '50+'
       END AS rango,
       COUNT(*) AS total
     FROM clientes_clases cc
     JOIN clases_horarios h ON h.id = cc.clase_horario_id
     JOIN clases c ON c.id = h.clase_id
     JOIN clientes cl ON cl.id = cc.cliente_id
     WHERE c.gym_id = ? AND c.id = ?
     GROUP BY rango`,
    [gymId, claseId],
  );
  return rows;
}

/** Cumulative attendance count for all sessions of a specific class. */
export async function totalClientesClase(gymId, claseId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM clientes_clases cc
     JOIN clases_horarios h ON h.id = cc.clase_horario_id
     JOIN clases c ON c.id = h.clase_id
     WHERE c.gym_id = ? AND c.id = ?`,
    [gymId, claseId],
  );
  return rows[0]?.total || 0;
}

/** Updates a scheduled session entry. */
export async function updateHorario(gymId, horarioId, data) {
  const horario = await getHorarioById(horarioId);
  if (!horario) throw new AppError("Schedule entry not found", 404);

  const [rows] = await pool.query(
    `SELECT h.*
     FROM clases_horarios h
     JOIN clases c ON c.id = h.clase_id
     WHERE h.id = ? AND c.gym_id = ?`,
    [horarioId, gymId]
  );

  if (!rows[0]) throw new AppError("Schedule entry does not belong to this gym branch", 403);

  const fields = [];
  const values = [];

  ["inicio", "fin", "aforo_maximo"].forEach(f => {
    if (data[f] !== undefined) {
      fields.push(`${f} = ?`);
      values.push(data[f]);
    }
  });

  if (!fields.length) return horario;

  values.push(horarioId);

  await pool.query(
    `UPDATE clases_horarios SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getHorarioById(horarioId);
}

/* ============================================================
   GLOBAL CONCURRENCY ANALYSIS
   ============================================================ */

/**
 * Retrieves occupancy and popularity metrics for all classes in a branch.
 * Orders by participation level to identify high-traffic class types.
 */
export async function clasesConCurrencia(gymId) {
  const [rows] = await pool.query(
    `SELECT 
       c.id,
       c.nombre,
       COUNT(DISTINCT cc.cliente_id) AS participantes,
       COUNT(DISTINCT ch.id) AS horarios,
       MAX(ch.aforo_maximo) AS aforo_maximo
     FROM clases c
     LEFT JOIN clases_horarios ch ON ch.clase_id = c.id
     LEFT JOIN clientes_clases cc ON cc.clase_horario_id = ch.id
     WHERE c.gym_id = ?
     GROUP BY c.id, c.nombre
     ORDER BY participantes DESC`,
    [gymId]
  );
  return rows;
}
