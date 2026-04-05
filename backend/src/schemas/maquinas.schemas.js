import { z } from "zod";

export const crearMaquinaSchema = {
  body: z.object({
    nombre: z.string().min(2),
    descripcion: z.string().optional(),
    uso: z.string().optional(),
    cantidad: z.coerce.number().int().min(0).optional(),
    ubicacion: z.string().optional(),
    foto: z.string().optional(),
  }),
};

export const actualizarMaquinaSchema = {
  body: z.object({
    nombre: z.string().min(2).optional(),
    descripcion: z.string().optional(),
    uso: z.string().optional(),
    cantidad: z.coerce.number().int().min(0).optional(),
    ubicacion: z.string().optional(),
    foto: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};
