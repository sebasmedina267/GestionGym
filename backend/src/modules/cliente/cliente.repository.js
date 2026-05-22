/**
 * Client Dashboard Repository
 * 
 * Data access layer for client-specific queries.
 * Handles all database operations for the USUARIO_FINAL dashboard.
 */

import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

/* ============================================================
   GYM AFFILIATION QUERIES
   ============================================================ */

/**
 * Get all gyms where a user is currently enrolled (ACTIVE status)
 */
export async function getUserGyms(userId) {
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.nombre,
        g.ciudad,
        g.direccion,
        g.foto,
        g.latitud,
        g.longitud,
        g.horario_inicio,
        g.horario_fin,
        g.telefono,
        g.email_contacto,
        ufg.estado_inscripcion,
        ufg.fecha_inscripcion,
        ufg.metodo_pago,
        COUNT(DISTINCT cl.id) as total_clases,
        COUNT(DISTINCT m.id) as total_maquinas
     FROM usuarios_finales_gimnasios ufg
     JOIN gyms g ON ufg.gym_id = g.id
     LEFT JOIN clases cl ON cl.gym_id = g.id
     LEFT JOIN maquinas m ON m.gym_id = g.id
     WHERE ufg.usuario_id = ? AND ufg.estado_inscripcion = 'ACTIVO'
     GROUP BY g.id
     ORDER BY ufg.fecha_inscripcion DESC`,
    [userId]
  );
  return rows;
}

/**
 * Get detailed info about a specific gym for an enrolled user
 */
export async function getUserGymDetails(userId, gymId) {
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.nombre,
        g.ciudad,
        g.direccion,
        g.foto,
        g.latitud,
        g.longitud,
        g.horario_inicio,
        g.horario_fin,
        g.telefono,
        g.email_contacto,
        ufg.estado_inscripcion,
        ufg.fecha_inscripcion,
        ufg.metodo_pago,
        COUNT(DISTINCT cl.id) as total_clases,
        COUNT(DISTINCT m.id) as total_maquinas,
        COUNT(DISTINCT p.id) as total_productos
     FROM usuarios_finales_gimnasios ufg
     JOIN gyms g ON ufg.gym_id = g.id
     LEFT JOIN clases cl ON cl.gym_id = g.id
     LEFT JOIN maquinas m ON m.gym_id = g.id
     LEFT JOIN productos p ON p.gym_id = g.id
     WHERE ufg.usuario_id = ? AND ufg.gym_id = ? AND ufg.estado_inscripcion = 'ACTIVO'
     GROUP BY g.id`,
    [userId, gymId]
  );
  return rows[0] || null;
}

/**
 * Check if user is enrolled in a gym
 */
export async function isUserEnrolledInGym(userId, gymId) {
  const [rows] = await pool.query(
    `SELECT * FROM usuarios_finales_gimnasios 
     WHERE usuario_id = ? AND gym_id = ? AND estado_inscripcion = 'ACTIVO'`,
    [userId, gymId]
  );
  return !!rows[0];
}

/**
 * Enroll user in a gym
 */
export async function enrollUserInGym(userId, gymId, metodoPago = 'STRIPE') {
  const [result] = await pool.query(
    `INSERT INTO usuarios_finales_gimnasios 
     (usuario_id, gym_id, metodo_pago, estado_inscripcion, fecha_inscripcion)
     VALUES (?, ?, ?, 'ACTIVO', NOW())
     ON DUPLICATE KEY UPDATE 
       estado_inscripcion = 'ACTIVO',
       fecha_inscripcion = NOW()`,
    [userId, gymId, metodoPago]
  );
  return result;
}

/**
 * Update gym enrollment status (pause, cancel, etc.)
 */
export async function updateGymEnrollmentStatus(userId, gymId, estado) {
  const [result] = await pool.query(
    `UPDATE usuarios_finales_gimnasios 
     SET estado_inscripcion = ?,
         fecha_cancelacion = IF(? = 'CANCELADO', NOW(), fecha_cancelacion)
     WHERE usuario_id = ? AND gym_id = ?`,
    [estado, estado, userId, gymId]
  );
  return result;
}

/* ============================================================
   CLASS ENROLLMENT QUERIES
   ============================================================ */

/**
 * Get classes the user is enrolled in (from their gym)
 */
export async function getUserClasses(userId, status = 'upcoming') {
  let timeCondition = '1=1';

  if (status === 'upcoming') {
    timeCondition = 'ch.inicio >= NOW()';
  } else if (status === 'past') {
    timeCondition = 'ch.inicio < NOW()';
  }

  const [rows] = await pool.query(
    `SELECT 
        c.id as clase_id,
        c.nombre as clase_nombre,
        c.descripcion,
        ch.id as horario_id,
        ch.inicio,
        ch.fin,
        ch.aforo_maximo,
        g.id as gym_id,
        g.nombre as gym_nombre,
        g.ciudad,
        COUNT(DISTINCT cc2.cliente_id) as inscritos_actuales,
        CASE 
          WHEN uf.id = ? THEN 1 
          ELSE 0 
        END as usuario_inscrito
     FROM usuarios_finales_gimnasios ufg
     JOIN gyms g ON ufg.gym_id = g.id
     JOIN clases c ON c.gym_id = g.id
     JOIN clases_horarios ch ON ch.clase_id = c.id
     LEFT JOIN clientes_clases cc ON cc.clase_horario_id = ch.id
     LEFT JOIN clientes_clases cc2 ON cc2.clase_horario_id = ch.id
     LEFT JOIN usuarios_finales uf ON uf.id = ?
     WHERE ufg.usuario_id = ? AND ufg.estado_inscripcion = 'ACTIVO'
     AND cc.cliente_id IS NOT NULL
     AND ${timeCondition}
     GROUP BY ch.id
     ORDER BY ch.inicio DESC`,
    [userId, userId, userId]
  );
  return rows;
}

/**
 * Get available classes for a gym (user can enroll in)
 */
export async function getAvailableClassesForGym(userId, gymId, includeEnrolled = false) {
  const enrolledCondition = includeEnrolled
    ? '1=1'
    : `cc.cliente_id IS NULL`;

  const [rows] = await pool.query(
    `SELECT 
        c.id as clase_id,
        c.nombre,
        c.descripcion,
        ch.id as horario_id,
        ch.inicio,
        ch.fin,
        ch.aforo_maximo,
        COUNT(DISTINCT cc.cliente_id) as inscritos_actuales,
        (ch.aforo_maximo - COUNT(DISTINCT cc.cliente_id)) as disponibles,
        GROUP_CONCAT(DISTINCT a.nombre SEPARATOR ', ') as monitores
     FROM clases c
     JOIN clases_horarios ch ON ch.clase_id = c.id
     JOIN gyms g ON c.gym_id = g.id
     LEFT JOIN clientes_clases cc ON cc.clase_horario_id = ch.id
     LEFT JOIN clases_monitores cm ON cm.clase_id = c.id
     LEFT JOIN admins a ON a.id = cm.admin_id
     WHERE g.id = ? AND ch.inicio >= NOW()
     GROUP BY ch.id
     ORDER BY ch.inicio ASC`,
    [gymId]
  );
  return rows;
}

/**
 * Check if user is enrolled in a specific class
 */
export async function isUserEnrolledInClass(userId, classScheduleId) {
  // Note: clientes_clases uses cliente_id, not usuario_id
  // We need to check if the user has a cliente record linked to their gyms
  const [rows] = await pool.query(
    `SELECT 1
     FROM clientes_clases cc
     JOIN clientes c ON c.id = cc.cliente_id
     JOIN usuarios_finales_gimnasios ufg ON ufg.gym_id = c.gym_id
     WHERE cc.clase_horario_id = ? AND ufg.usuario_id = ?`,
    [classScheduleId, userId]
  );
  return !!rows[0];
}

/**
 * Enroll user in a class
 */
export async function enrollUserInClass(userId, classScheduleId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Get the gym_id from the class schedule
    const [classRows] = await conn.query(
      `SELECT c.gym_id FROM clases_horarios ch
       JOIN clases c ON c.id = ch.clase_id
       WHERE ch.id = ?`,
      [classScheduleId]
    );

    if (!classRows[0]) {
      throw new AppError("Class schedule not found", 404);
    }

    const gymId = classRows[0].gym_id;

    // Verify user is enrolled in this gym
    const [enrollmentRows] = await conn.query(
      `SELECT * FROM usuarios_finales_gimnasios 
       WHERE usuario_id = ? AND gym_id = ? AND estado_inscripcion = 'ACTIVO'`,
      [userId, gymId]
    );

    if (!enrollmentRows[0]) {
      throw new AppError("User is not enrolled in this gym", 403);
    }

    // Get or create cliente record for this user in this gym
    let [clienteRows] = await conn.query(
      `SELECT id FROM clientes WHERE gym_id = ? AND email = (
        SELECT email FROM usuarios_finales WHERE id = ?
      )`,
      [gymId, userId]
    );

    let clienteId;
    if (clienteRows[0]) {
      clienteId = clienteRows[0].id;
    } else {
      // Create cliente record from usuario_final data
      const [userRows] = await conn.query(
        `SELECT nombre, apellido FROM usuarios_finales WHERE id = ?`,
        [userId]
      );

      if (!userRows[0]) {
        throw new AppError("User not found", 404);
      }

      const [insertResult] = await conn.query(
        `INSERT INTO clientes (gym_id, nombre, apellido, tipo_usuario)
         VALUES (?, ?, ?, 'USUARIO_APP')`,
        [gymId, userRows[0].nombre, userRows[0].apellido]
      );
      clienteId = insertResult.insertId;
    }

    // Check capacity
    const [capacityRows] = await conn.query(
      `SELECT COUNT(*) as inscritos, h.aforo_maximo
       FROM clientes_clases cc
       JOIN clases_horarios h ON h.id = cc.clase_horario_id
       WHERE cc.clase_horario_id = ?
       GROUP BY h.id`,
      [classScheduleId]
    );

    if (capacityRows[0]) {
      const { inscritos, aforo_maximo } = capacityRows[0];
      if (aforo_maximo && inscritos >= aforo_maximo) {
        throw new AppError("Class is full", 400);
      }
    }

    // Check if already enrolled
    const [dupRows] = await conn.query(
      `SELECT * FROM clientes_clases WHERE cliente_id = ? AND clase_horario_id = ?`,
      [clienteId, classScheduleId]
    );

    if (dupRows[0]) {
      throw new AppError("User is already enrolled in this class", 400);
    }

    // Enroll
    const [result] = await conn.query(
      `INSERT INTO clientes_clases (cliente_id, clase_horario_id) VALUES (?, ?)`,
      [clienteId, classScheduleId]
    );

    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Unenroll user from a class
 */
export async function unenrollUserFromClass(userId, classScheduleId) {
  const [result] = await pool.query(
    `DELETE cc FROM clientes_clases cc
     JOIN clientes c ON c.id = cc.cliente_id
     JOIN usuarios_finales_gimnasios ufg ON ufg.gym_id = c.gym_id
     WHERE cc.clase_horario_id = ? AND ufg.usuario_id = ?`,
    [classScheduleId, userId]
  );
  return result;
}

/* ============================================================
   MACHINES QUERIES
   ============================================================ */

/**
 * Get machines at a gym
 */
export async function getGymMachines(gymId) {
  const [rows] = await pool.query(
    `SELECT 
        id,
        nombre,
        descripcion,
        uso,
        cantidad,
        ubicacion,
        foto
     FROM maquinas
     WHERE gym_id = ?
     ORDER BY nombre ASC`,
    [gymId]
  );
  return rows;
}

/* ============================================================
   PRODUCTS QUERIES
   ============================================================ */

/**
 * Get products from a gym
 */
export async function getGymProducts(gymId, merchandiseOnly = false) {
  let query = `SELECT 
                id,
                nombre,
                descripcion,
                precio_unitario,
                cantidad,
                foto,
                es_merchandising
             FROM productos
             WHERE gym_id = ? AND disponible_para_compra = 1`;

  const params = [gymId];

  if (merchandiseOnly) {
    query += ` AND es_merchandising = 1`;
  }

  query += ` ORDER BY nombre ASC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

/* ============================================================
   USER PROFILE QUERIES
   ============================================================ */

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const [rows] = await pool.query(
    `SELECT 
        id,
        email,
        nombre,
        apellido,
        foto,
        activo,
        tipo_suscripcion,
        última_actividad,
        latitud,
        longitud
     FROM usuarios_finales
     WHERE id = ?`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, data) {
  const updates = [];
  const values = [];

  if (data.nombre !== undefined) {
    updates.push('nombre = ?');
    values.push(data.nombre);
  }
  if (data.apellido !== undefined) {
    updates.push('apellido = ?');
    values.push(data.apellido);
  }
  if (data.latitud !== undefined) {
    updates.push('latitud = ?');
    values.push(data.latitud);
  }
  if (data.longitud !== undefined) {
    updates.push('longitud = ?');
    values.push(data.longitud);
  }

  if (updates.length === 0) return null;

  values.push(userId);

  const [result] = await pool.query(
    `UPDATE usuarios_finales SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return result;
}

/**
 * Update last activity timestamp
 */
export async function updateLastActivity(userId) {
  await pool.query(
    `UPDATE usuarios_finales SET última_actividad = NOW() WHERE id = ?`,
    [userId]
  );
}

/* ============================================================
   TRANSACTION QUERIES
   ============================================================ */

/**
 * Get user's transaction history
 */
export async function getUserTransactions(userId, gymId = null, limit = 50, offset = 0) {
  let query = `SELECT 
                p.id,
                p.gym_id,
                g.nombre as gym_nombre,
                p.importe,
                p.fecha_pago,
                p.metodo_pago,
                p.periodo_inicio,
                p.periodo_fin,
                CASE 
                  WHEN p.clase_id IS NOT NULL THEN 'CLASE'
                  WHEN p.precio_id IS NOT NULL THEN 'MEMBRESÍA'
                  ELSE 'OTRO'
                END as tipo_transaccion
             FROM pagos p
             JOIN gyms g ON p.gym_id = g.id
             JOIN usuarios_finales_gimnasios ufg ON ufg.gym_id = p.gym_id
             WHERE ufg.usuario_id = ?`;

  const params = [userId];

  if (gymId) {
    query += ` AND p.gym_id = ?`;
    params.push(gymId);
  }

  query += ` ORDER BY p.fecha_pago DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * Get transaction statistics
 */
export async function getUserTransactionStats(userId) {
  const [rows] = await pool.query(
    `SELECT 
        COUNT(*) as total_transacciones,
        SUM(p.importe) as total_gastado,
        AVG(p.importe) as promedio_gasto,
        MAX(p.fecha_pago) as ultima_transaccion,
        GROUP_CONCAT(DISTINCT g.nombre SEPARATOR ', ') as gyms
     FROM pagos p
     JOIN gyms g ON p.gym_id = g.id
     JOIN usuarios_finales_gimnasios ufg ON ufg.gym_id = p.gym_id
     WHERE ufg.usuario_id = ?`,
    [userId]
  );
  return rows[0];
}

/* ============================================================
   NATIVE CLIENT QUERIES
   ============================================================ */

export async function getNativeClientGymDetails(clienteId, gymId) {
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.nombre,
        g.ciudad,
        g.direccion,
        g.foto,
        g.latitud,
        g.longitud,
        g.horario_inicio,
        g.horario_fin,
        g.telefono,
        g.email_contacto,
        'ACTIVO' as estado_inscripcion,
        NULL as fecha_inscripcion,
        'EFECTIVO' as metodo_pago,
        COUNT(DISTINCT cl.id) as total_clases,
        COUNT(DISTINCT m.id) as total_maquinas,
        COUNT(DISTINCT p.id) as total_productos
     FROM clientes c
     JOIN gyms g ON c.gym_id = g.id
     LEFT JOIN clases cl ON cl.gym_id = g.id
     LEFT JOIN maquinas m ON m.gym_id = g.id
     LEFT JOIN productos p ON p.gym_id = g.id
     WHERE c.id = ? AND c.gym_id = ?
     GROUP BY g.id`,
    [clienteId, gymId]
  );
  return rows[0] || null;
}

export async function getNativeClientClasses(clienteId, status = 'upcoming') {
  let timeCondition = '1=1';

  if (status === 'upcoming') {
    timeCondition = 'ch.inicio >= NOW()';
  } else if (status === 'past') {
    timeCondition = 'ch.inicio < NOW()';
  }

  const [rows] = await pool.query(
    `SELECT 
        c.id as clase_id,
        c.nombre as clase_nombre,
        c.descripcion,
        ch.id as horario_id,
        ch.inicio,
        ch.fin,
        ch.aforo_maximo,
        g.id as gym_id,
        g.nombre as gym_nombre,
        g.ciudad,
        COUNT(DISTINCT cc2.cliente_id) as inscritos_actuales,
        1 as usuario_inscrito
     FROM clientes cli
     JOIN clientes_clases cc ON cc.cliente_id = cli.id
     JOIN clases_horarios ch ON ch.id = cc.clase_horario_id
     JOIN clases c ON c.id = ch.clase_id
     JOIN gyms g ON c.gym_id = g.id
     LEFT JOIN clientes_clases cc2 ON cc2.clase_horario_id = ch.id
     WHERE cli.id = ? AND ${timeCondition}
     GROUP BY ch.id
     ORDER BY ch.inicio DESC`,
    [clienteId]
  );
  return rows;
}

export async function isNativeClientEnrolledInClass(clienteId, classScheduleId) {
  const [rows] = await pool.query(
    `SELECT 1 FROM clientes_clases WHERE cliente_id = ? AND clase_horario_id = ?`,
    [clienteId, classScheduleId]
  );
  return !!rows[0];
}

export async function enrollNativeClientInClass(clienteId, classScheduleId) {
  const [result] = await pool.query(
    `INSERT INTO clientes_clases (cliente_id, clase_horario_id) VALUES (?, ?)`,
    [clienteId, classScheduleId]
  );
  return result;
}

export async function unenrollNativeClientFromClass(clienteId, classScheduleId) {
  const [result] = await pool.query(
    `DELETE FROM clientes_clases WHERE cliente_id = ? AND clase_horario_id = ?`,
    [clienteId, classScheduleId]
  );
  return result;
}

export async function getNativeClientProfile(clienteId) {
  const [rows] = await pool.query(
    `SELECT 
        id,
        email,
        nombre,
        apellido,
        NULL as foto,
        activo,
        'NATIVE' as tipo_suscripcion,
        NULL as última_actividad,
        NULL as latitud,
        NULL as longitud
     FROM clientes
     WHERE id = ?`,
    [clienteId]
  );
  return rows[0] || null;
}

export async function updateNativeClientProfile(clienteId, data) {
  const updates = [];
  const values = [];

  if (data.nombre !== undefined) {
    updates.push('nombre = ?');
    values.push(data.nombre);
  }
  if (data.apellido !== undefined) {
    updates.push('apellido = ?');
    values.push(data.apellido);
  }

  if (updates.length === 0) return null;

  values.push(clienteId);

  const [result] = await pool.query(
    `UPDATE clientes SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return result;
}

export async function getNativeClientTransactions(clienteId, limit = 50, offset = 0) {
  return [];
}

export async function getNativeClientTransactionStats(clienteId) {
  return {
    total_transacciones: 0,
    total_gastado: 0,
    promedio_gasto: 0,
    ultima_transaccion: null,
    gyms: ""
  };
}
