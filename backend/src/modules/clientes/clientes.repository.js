import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Validates member profile data before database persistence.
 * @param {Object} data - Member attributes.
 * @throws {AppError} 400 if validation constraints are violated.
 */
function validarDatosCliente({ nombre, apellido, edad, sexo }) {
  if (!nombre || nombre.trim().length === 0) {
    throw new AppError("Member Identity Violation: First name is mandatory", 400);
  }

  if (!apellido || apellido.trim().length === 0) {
    throw new AppError("Member Identity Violation: Last name is mandatory", 400);
  }

  if (edad !== null && edad !== undefined) {
    if (isNaN(edad) || edad < 0 || edad > 120) {
      throw new AppError("Profile Error: Age must be a valid number between 0 and 120", 400);
    }
  }

  if (sexo !== null && sexo !== undefined) {
    const validos = ["M", "F", "O"]; // Male, Female, Other
    if (!validos.includes(sexo)) {
      throw new AppError("Profile Error: Gender must be categorized as M, F, or O", 400);
    }
  }
}

/* ============================================================
   MEMBER DISCOVERY SERVICES
   ============================================================ */

/**
 * Retrieves a unified member directory for a branch.
 * Strategy: Combines local branch members with cross-platform App Users enrolled in this branch.
 * 
 * @param {number} gymId - The target branch identifier.
 * @param {boolean} includeInactivos - Flag to include deactivated records.
 * @returns {Promise<Array>} A comprehensive collection of member entities.
 */
export async function findByGym(gymId, includeInactivos = true) {
  const [rows] = await pool.query(
    `SELECT 
        c.id as id,
        c.nombre,
        c.apellido,
        c.edad,
        c.sexo,
        c.activo,
        c.email,
        c.tipo_usuario,
        'CLIENTE' as tipo_origen,
        GROUP_CONCAT(DISTINCT cl.nombre SEPARATOR ', ') as clases_inscritas
     FROM clientes c
     LEFT JOIN clientes_clases cc ON c.id = cc.cliente_id
     LEFT JOIN clases_horarios ch ON cc.clase_horario_id = ch.id
     LEFT JOIN clases cl ON ch.clase_id = cl.id
     WHERE c.gym_id = ?
     GROUP BY c.id

     UNION ALL

     SELECT 
        uf.id as id,
        uf.nombre,
        uf.apellido,
        NULL as edad,
        NULL as sexo,
        IF(ufg.estado_inscripcion = 'ACTIVO', 1, 0) as activo,
        uf.email,
        'USUARIO_APP' as tipo_usuario,
        'APP' as tipo_origen,
        NULL as clases_inscritas
     FROM usuarios_finales uf
     JOIN usuarios_finales_gimnasios ufg ON uf.id = ufg.usuario_id
     WHERE ufg.gym_id = ?

     ORDER BY activo DESC, nombre ASC`,
    [gymId, gymId]
  );
  return rows;
}

/* ============================================================
   MEMBER PERSISTENCE: CREATION
   ============================================================ */

/**
 * Persists a new member record to the branch registry.
 * 
 * @param {number} gymId - Branch identifier.
 * @param {Object} data - Profile attributes.
 * @returns {Promise<Object>} The persisted member entity.
 */
export async function create(gymId, data) {
  validarDatosCliente(data);

  const { 
    nombre, 
    apellido, 
    edad = null, 
    sexo = null, 
    email = null, 
    password = null, 
    tipo_usuario = 'CLIENTE' 
  } = data;

  const [result] = await pool.query(
    `INSERT INTO clientes (gym_id, nombre, apellido, edad, sexo, email, password, tipo_usuario, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [gymId, nombre, apellido, edad, sexo, email, password, tipo_usuario],
  );

  return getById(gymId, result.insertId);
}

/* ============================================================
   MEMBER PERSISTENCE: UPDATES
   ============================================================ */

/**
 * Synchronizes modifications to a member record.
 * Handles dual-source logic (Local Members vs. App Users).
 * 
 * @param {number} gymId - Branch context for scoping.
 * @param {number} id - Target member identifier.
 * @param {Object} data - Set of parameters to update.
 */
export async function update(gymId, id, data) {
  // Case A: External cross-platform App Users (Managed via enrollment state)
  if (data.tipo_origen === 'APP') {
    if (data.activo !== undefined) {
      const statusValue = data.activo ? 'ACTIVO' : 'PAUSADO';
      await pool.query(
        `UPDATE usuarios_finales_gimnasios
         SET estado_inscripcion = ?
         WHERE gym_id = ? AND usuario_id = ?`,
        [statusValue, gymId, id]
      );
    }
    return { id, tipo_origen: 'APP', activo: data.activo };
  }

  // Case B: Native Local Members
  const member = await getById(gymId, id);
  if (!member) throw new AppError("Resource Error: Member entity not found", 404);

  validarDatosCliente({
    nombre: data.nombre ?? member.nombre,
    apellido: data.apellido ?? member.apellido,
    edad: data.edad ?? member.edad,
    sexo: data.sexo ?? member.sexo,
  });

  const fields = [];
  const values = [];

  // Dynamic field mapping
  if (data.nombre !== undefined) {
    fields.push("nombre = ?");
    values.push(data.nombre);
  }
  if (data.apellido !== undefined) {
    fields.push("apellido = ?");
    values.push(data.apellido);
  }
  if (data.edad !== undefined) {
    fields.push("edad = ?");
    values.push(data.edad);
  }
  if (data.sexo !== undefined) {
    fields.push("sexo = ?");
    values.push(data.sexo);
  }

  // Lifecycle Tracking: Deactivation and retention timestamps
  if (data.activo !== undefined) {
    fields.push("activo = ?");
    values.push(data.activo);

    if (data.activo === 0) {
      fields.push("fecha_baja = CURRENT_DATE"); // Entry point for retention clock
    } else {
      fields.push("fecha_baja = NULL"); // Reset retention clock
    }
  }

  if (!fields.length) return member;

  values.push(gymId, id);

  await pool.query(
    `UPDATE clientes
     SET ${fields.join(", ")}
     WHERE gym_id = ? AND id = ?`,
    values,
  );

  return getById(gymId, id);
}

/* ============================================================
   DATA RETRIEVAL: INDIVIDUAL
   ============================================================ */

/** Retrieves identity and profile data for a single member by ID. */
export async function getById(gymId, id) {
  const [rows] = await pool.query(
    "SELECT * FROM clientes WHERE gym_id = ? AND id = ?",
    [gymId, id],
  );
  return rows[0];
}

/* ============================================================
   DATA DESTRUCTION SERVICES
   ============================================================ */

/** Permanently purges a native member record from the registry. */
export async function remove(gymId, id) {
  const member = await getById(gymId, id);
  if (!member) throw new AppError("Resource Error: Member not found", 404);

  await pool.query("DELETE FROM clientes WHERE gym_id = ? AND id = ?", [
    gymId,
    id,
  ]);
}

/**
 * Executes a strategic data retention policy by purging stale, deactivated records.
 * Policy: Deactivated members with zero activity for N months are permanently removed.
 */
export async function deletePermanentlyInactiveClients(gymId, months = 4) {
  const [result] = await pool.query(
    `DELETE FROM clientes 
     WHERE gym_id = ? 
     AND activo = 0 
     AND fecha_baja IS NOT NULL 
     AND DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH) >= fecha_baja`,
    [gymId, months]
  );
  return result;
}

/* ============================================================
   ANALYTICAL AGGREGATION QUERIES
   ============================================================ */

/** Aggregates active member distribution by gender. */
export async function statsGenero(gymId) {
  const [rows] = await pool.query(
    `SELECT sexo, COUNT(*) AS total
     FROM clientes
     WHERE gym_id = ? AND activo = 1
     GROUP BY sexo`,
    [gymId],
  );
  return rows;
}

/** Aggregates active member distribution by age demographic ranges. */
export async function statsEdad(gymId) {
  const [rows] = await pool.query(
    `SELECT 
       CASE 
         WHEN edad < 18 THEN '<18'
         WHEN edad BETWEEN 18 AND 25 THEN '18-25'
         WHEN edad BETWEEN 26 AND 35 THEN '26-35'
         WHEN edad BETWEEN 36 AND 50 THEN '36-50'
         ELSE '50+'
       END AS rango,
       COUNT(*) AS total
     FROM clientes
     WHERE gym_id = ? AND activo = 1
     GROUP BY rango`,
    [gymId],
  );
  return rows;
}
