-- ============================================================
-- MIGRATION: Add ENCARGADO role to admins_gyms table
-- Date: 2026-05-19
-- Description: Expand rol ENUM to support ENCARGADO (branch manager) role
-- ============================================================

-- Update admins_gyms ENUM to include ENCARGADO and EMPLEADO
ALTER TABLE admins_gyms 
MODIFY COLUMN rol ENUM('DUENO','TRABAJADOR','ENCARGADO','EMPLEADO') NOT NULL COMMENT 'Admin role: DUENO (owner), ENCARGADO (branch manager), EMPLEADO/TRABAJADOR (staff)';

-- Add role tracking columns for audit
ALTER TABLE admins_gyms 
ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Role assignment date',
ADD COLUMN IF NOT EXISTS modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification';

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_admins_gyms_rol ON admins_gyms(rol);

COMMIT;
