-- Migración: Agregar rol ENCARGADO a tabla admins_gyms
-- Fecha: 19-05-2026
-- Descripción: Sprint 2 - Rol de encargado de gym para personal promovido

ALTER TABLE admins_gyms 
MODIFY rol ENUM('DUENO', 'ENCARGADO', 'EMPLEADO', 'TRABAJADOR') NOT NULL;

-- Verificar cambio
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='admins_gyms' AND COLUMN_NAME='rol';
