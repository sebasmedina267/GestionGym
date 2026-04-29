import { z } from "zod";

export const crearClienteSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    edad: z.number().int().min(0).max(120).optional(),
    sexo: z.enum(["M", "F", "O"]).optional(),
    email: z.string().email().optional(),
  }),
};

export const actualizarClienteSchema = {
  body: z.object({
    nombre: z.string().min(2).optional(),
    apellido: z.string().min(2).optional(),
    edad: z.number().int().min(0).max(120).optional(),
    sexo: z.enum(["M", "F", "O"]).optional(),
    activo: z.union([z.boolean(), z.number()]).transform((val) => Boolean(val)).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const eliminarClienteSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};
