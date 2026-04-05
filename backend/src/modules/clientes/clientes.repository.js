import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   VALIDACIONES
============================================================ */

function validarDatosCliente({ nombre, apellido, edad, sexo }) {
  if (!nombre || nombre.trim().length === 0) {
    throw new AppError("El nombre es obligatorio", 400);
  }

  if (!apellido || apellido.trim().length === 0) {
    throw new AppError("El apellido es obligatorio", 400);
  }

  if (edad !== null && edad !== undefined) {
    if (isNaN(edad) || edad < 0 || edad > 120) {
      throw new AppError("Edad inválida", 400);
    }
  }

  if (sexo !== null && sexo !== undefined) {
    const validos = ["M", "F", "O"];
    if (!validos.includes(sexo)) {
      throw new AppError("Sexo inválido (M, F u O)", 400);
    }
  }
}

/* ============================================================
   LISTAR CLIENTES ACTIVOS E INACTIVOS
============================================================ */

export async function findByGym(gymId, includeInactivos = true) {
  const [rows] = await pool.query(
    `SELECT c.*, 
            GROUP_CONCAT(DISTINCT cl.nombre SEPARATOR ', ') as clases_inscritas
     FROM clientes c
     LEFT JOIN clientes_clases cc ON c.id = cc.cliente_id
     LEFT JOIN clases_horarios ch ON cc.clase_horario_id = ch.id
     LEFT JOIN clases cl ON ch.clase_id = cl.id
     WHERE c.gym_id = ?
     GROUP BY c.id
     ORDER BY c.activo DESC, c.nombre ASC`,
    [gymId]
  );
  return rows;
}

/* ============================================================
   CREAR CLIENTE
============================================================ */

export async function create(gymId, data) {
  validarDatosCliente(data);

  const { nombre, apellido, edad = null, sexo = null } = data;

  const [result] = await pool.query(
    `INSERT INTO clientes (gym_id, nombre, apellido, edad, sexo, activo)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [gymId, nombre, apellido, edad, sexo],
  );

  return getById(gymId, result.insertId);
}

/* ============================================================
   ACTUALIZAR CLIENTE
============================================================ */

export async function update(gymId, id, data) {
  const cliente = await getById(gymId, id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  validarDatosCliente({
    nombre: data.nombre ?? cliente.nombre,
    apellido: data.apellido ?? cliente.apellido,
    edad: data.edad ?? cliente.edad,
    sexo: data.sexo ?? cliente.sexo,
  });

  const fields = [];
  const values = [];

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

  // Manejo de baja
  if (data.activo !== undefined) {
    fields.push("activo = ?");
    values.push(data.activo);

    if (data.activo === 0) {
      fields.push("fecha_baja = CURRENT_DATE");
    } else {
      fields.push("fecha_baja = NULL");
    }
  }

  if (!fields.length) return cliente;

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
   OBTENER CLIENTE POR ID
============================================================ */

export async function getById(gymId, id) {
  const [rows] = await pool.query(
    "SELECT * FROM clientes WHERE gym_id = ? AND id = ?",
    [gymId, id],
  );
  return rows[0];
}

/* ============================================================
   ELIMINAR CLIENTE
============================================================ */

export async function remove(gymId, id) {
  const cliente = await getById(gymId, id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  await pool.query("DELETE FROM clientes WHERE gym_id = ? AND id = ?", [
    gymId,
    id,
  ]);
}

/* ============================================================
   ELIMINAR PERMANENTEMENTE INACTIVOS (4+ MESES)
============================================================ */

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
   ESTADÍSTICAS
============================================================ */

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
