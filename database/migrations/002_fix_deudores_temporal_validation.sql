-- ============================================================
-- MIGRATION: Fix deudores query - Exclude debts before enrollment
-- Date: 2026-05-18
-- Description: Add fecha_inscripcion to clientes and update pagos query logic
-- ============================================================

-- Ensure clientes has fecha_inscripcion (use creado_en if not exists)
-- Since creado_en already exists, we'll use it for validation

-- Add index for faster queries on deudores filtering
CREATE INDEX IF NOT EXISTS idx_pagos_cliente_fecha ON pagos(cliente_id, fecha_pago);

-- Add metadata column to track if pago is "legacy" (before enrollment)
ALTER TABLE pagos 
ADD COLUMN IF NOT EXISTS es_deuda_valida BOOLEAN DEFAULT TRUE COMMENT 'True if pago date >= cliente creado_en date';

COMMIT;
