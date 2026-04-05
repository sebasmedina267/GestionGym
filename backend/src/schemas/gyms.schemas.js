import { z } from "zod";

export const crearGymSchema = {
  body: z.object({
    nombre: z.string().min(1, "Nombre del gym es obligatorio"),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    foto: z.string().optional(),
  }),
};

export const actualizarGymSchema = {
  body: z.object({
    nombre: z.string().min(1).optional(),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    foto: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const asignarGymSchema = {
  body: z.object({
    gym_id: z.number().int().positive("ID del gym es obligatorio"),
  }),
};
