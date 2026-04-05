import { z } from "zod";

export const crearClaseSchema = {
  body: z.object({
    nombre: z.string().min(2),
    descripcion: z.string().optional(),
    monitor_id: z.coerce.number().int().positive().optional(),
  }),
};

export const actualizarClaseSchema = {
  body: z.object({
    nombre: z.string().min(2).optional(),
    descripcion: z.string().optional(),
    monitor_id: z.coerce.number().int().positive().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const crearHorarioSchema = {
  body: z.object({
    inicio: z.string().min(1, "La fecha de inicio es requerida"),
    fin: z.string().min(1, "La fecha de fin es requerida"),
    aforo_maximo: z.coerce.number().int().positive().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const crearPrecioSchema = {
  body: z.object({
    nombre: z.string().min(2, "El nombre es requerido"),
    tipo_unidad: z.enum(["MES", "CLASES", "DIA", "MEDIO_MES"]),
    cantidad_unidad: z.coerce.number().int().positive().optional(),
    precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const actualizarPrecioSchema = {
  body: z.object({
    nombre: z.string().min(2).optional(),
    tipo_unidad: z.enum(["MES", "CLASES", "DIA", "MEDIO_MES"]).optional(),
    cantidad_unidad: z.coerce.number().int().positive().optional(),
    precio: z.coerce.number().positive().optional(),
    activo: z.boolean().optional(),
  }),
  params: z.object({
    precioId: z.string().regex(/^\d+$/),
  }),
};

export const agregarMonitorSchema = {
  body: z.object({
    admin_id: z.coerce.number().int().positive("El ID del monitor es requerido"),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

export const inscribirClienteSchema = {
  params: z.object({
    horarioId: z.string().regex(/^\d+$/),
    clienteId: z.string().regex(/^\d+$/),
  }),
};
