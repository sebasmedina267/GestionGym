import cron from "node-cron";
import { pool } from "../config/db.js";

/**
 * Cron Job: Cleanup Inactive Users
 * 
 * Runs daily at 3:00 AM to purge users that:
 * 1. Have no gym assigned and were created > 7 days ago.
 * 2. Have not logged in for > 30 days and are PAUSADO or no active gym.
 */
export function startCleanupJob() {
  console.log("🛠️  Cleanup job registered. Will run daily at 03:00 AM");

  cron.schedule("0 3 * * *", async () => {
    console.log("🧹 Running inactive user cleanup cron job...");
    try {
      const conn = await pool.getConnection();
      
      try {
        await conn.beginTransaction();

        // 1. Find and delete users with no gym who registered more than 7 days ago
        // Wait, 'usuarios_finales' vs 'usuarios_finales_gimnasios'
        // If they don't have ANY gym assigned.
        const [noGymResult] = await conn.query(`
          DELETE uf FROM usuarios_finales uf
          LEFT JOIN usuarios_finales_gimnasios ufg ON uf.id = ufg.usuario_id
          WHERE ufg.usuario_id IS NULL
          AND uf.fecha_registro < DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        console.log(`🗑️  Deleted ${noGymResult.affectedRows} users with no gym (> 7 days)`);

        // 2. Find and delete users inactive for > 30 days who don't have ACTIVO status anywhere
        const [inactiveResult] = await conn.query(`
          DELETE uf FROM usuarios_finales uf
          WHERE uf.última_actividad < DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND NOT EXISTS (
            SELECT 1 FROM usuarios_finales_gimnasios ufg 
            WHERE ufg.usuario_id = uf.id AND ufg.estado_inscripcion = 'ACTIVO'
          )
        `);

        console.log(`🗑️  Deleted ${inactiveResult.affectedRows} inactive users (> 30 days, no active gym)`);

        await conn.commit();
        console.log("✅ Cleanup job completed successfully.");
      } catch (err) {
        await conn.rollback();
        console.error("❌ Error during cleanup transaction:", err);
      } finally {
        conn.release();
      }
    } catch (dbErr) {
      console.error("❌ Failed to get connection for cleanup job:", dbErr);
    }
  });
}
