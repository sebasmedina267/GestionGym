import { z } from "zod";

export const crearIngresoSchema = {
  body: z.object({
    descripcion: z.string().min(2),
    importe: z.number().positive(),
    fecha: z.string().date(),
  }),
};

export const crearGastoSchema = {
  body: z.object({
    descripcion: z.string().min(2),
    importe: z.number().positive(),
    fecha: z.string().date(),
  }),
};
