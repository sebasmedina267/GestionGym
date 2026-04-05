import { z } from "zod";

export const crearProductoSchema = {
  body: z.object({
    nombre: z.string().min(2),
    descripcion: z.string().optional(),
    precio_unitario: z.coerce.number().positive(),
    cantidad: z.coerce.number().int().min(0).optional(),
    foto: z.string().optional(),
  }),
};

export const actualizarProductoSchema = {
  body: z.object({
    nombre: z.string().min(2).optional(),
    descripcion: z.string().optional(),
    precio_unitario: z.number().positive().optional(),
    cantidad: z.number().int().min(0).optional(),
    foto: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const compraVentaSchema = {
  body: z.object({
    cantidad: z.number().int().positive(),
    precio_unitario: z.number().positive(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};
