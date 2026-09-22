-- ============================================================
-- MIGRATION: Add geolocation support to gyms and users
-- Date: 2026-05-08
-- Description: Add latitude/longitude for nearby gym searches
-- ============================================================

-- Add geolocation columns to gyms table
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8) COMMENT 'Latitude for geolocation',
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8) COMMENT 'Longitude for geolocation',
ADD COLUMN IF NOT EXISTS horario_inicio TIME DEFAULT '06:00:00' COMMENT 'Gym opening time',
ADD COLUMN IF NOT EXISTS horario_fin TIME DEFAULT '22:00:00' COMMENT 'Gym closing time',
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20) COMMENT 'Gym contact phone',
ADD COLUMN IF NOT EXISTS email_contacto VARCHAR(255) COMMENT 'Gym contact email';

-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_gyms_ubicacion ON gyms(latitud, longitud);

-- Add tracking columns to usuarios_finales
ALTER TABLE usuarios_finales 
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8) COMMENT 'User latitude for location-based search',
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8) COMMENT 'User longitude',
ADD COLUMN IF NOT EXISTS última_actividad DATETIME COMMENT 'Last login timestamp',
ADD COLUMN IF NOT EXISTS foto VARCHAR(255) DEFAULT NULL COMMENT 'User profile photo';

-- Create index for user last activity (for inactivity cleanup)
CREATE INDEX IF NOT EXISTS idx_usuarios_finales_última_actividad ON usuarios_finales(última_actividad);

-- Ensure usuarios_finales_gimnasios has proper state tracking
ALTER TABLE usuarios_finales_gimnasios 
ADD COLUMN IF NOT EXISTS estado_inscripcion ENUM('ACTIVO', 'PAUSADO', 'PENDIENTE_PAGO', 'CANCELADO') DEFAULT 'ACTIVO' COMMENT 'Enrollment state',
ADD COLUMN IF NOT EXISTS fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Enrollment date',
ADD COLUMN IF NOT EXISTS fecha_cancelacion DATETIME COMMENT 'Cancellation date',
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT COMMENT 'Reason for cancellation';

-- Create index for querying active enrollments
CREATE INDEX IF NOT EXISTS idx_usuarios_finales_gimnasios_estado ON usuarios_finales_gimnasios(estado_inscripcion, usuario_id);

-- Add columns for tracking gym products/merchandising
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS disponible_para_compra BOOLEAN DEFAULT TRUE COMMENT 'Allow purchase via app',
ADD COLUMN IF NOT EXISTS es_merchandising BOOLEAN DEFAULT FALSE COMMENT 'Is this merchandising item';

COMMIT;
