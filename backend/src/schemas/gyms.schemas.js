import { z } from "zod";

export const crearGymSchema = {
  body: z.object({
    nombre: z.string().min(1, "Nombre del gym es obligatorio"),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    foto: z.string().optional(),
    urlWeb: z.string().url("URL inválida").optional().or(z.literal("")),
    latitud: z.number().min(-90).max(90, "Latitud debe estar entre -90 y 90"),
    longitud: z.number().min(-180).max(180, "Longitud debe estar entre -180 y 180"),
  }),
};

export const actualizarGymSchema = {
  body: z.object({
    nombre: z.string().min(1).optional(),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    foto: z.string().optional(),
    urlWeb: z.string().url("URL inválida").optional().or(z.literal("")),
    latitud: z.number().min(-90).max(90).optional(),
    longitud: z.number().min(-180).max(180).optional(),
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
