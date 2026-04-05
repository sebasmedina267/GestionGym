import { z } from "zod";

export const crearPagoSchema = {
  body: z.object({
    cliente_id: z.number().int().positive(),
    precio_id: z.number().int().positive().optional(),
    clase_id: z.number().int().positive().optional(),
    pagado: z.boolean().optional(),
    importe: z.number().positive(),
    fecha_pago: z.string().date(),
    periodo_inicio: z.string().date().optional(),
    periodo_fin: z.string().date().optional(),
    metodo_pago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'CRIPTOMONEDA']).optional(),
  }),
};

export const actualizarPagoSchema = {
  body: z.object({
    precio_id: z.number().int().positive().optional(),
    clase_id: z.number().int().positive().optional(),
    pagado: z.boolean().optional(),
    importe: z.number().positive().optional(),
    fecha_pago: z.string().date().optional(),
    periodo_inicio: z.string().date().optional(),
    periodo_fin: z.string().date().optional(),
    metodo_pago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'CRIPTOMONEDA']).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};
