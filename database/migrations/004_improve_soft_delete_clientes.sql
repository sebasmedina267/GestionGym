-- Migración: Mejorar soft delete en clientes
-- Fecha: 1-06-2026
-- Descripción: Cambiar de flag booleano a timestamp para mejor auditoría

ALTER TABLE clientes 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER fecha_baja;

-- Migrar datos existentes
UPDATE clientes SET deleted_at = CURRENT_TIMESTAMP WHERE activo = 0;

-- Crear índice para queries de soft delete
CREATE INDEX idx_clientes_deleted_at ON clientes(gym_id, deleted_at);

-- Verificar cambios
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='clientes' AND COLUMN_NAME IN ('activo', 'deleted_at');
