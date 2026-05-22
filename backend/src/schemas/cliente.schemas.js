import { z } from "zod";

/**
 * Schema for enrolling in a gym
 */
export const enrollGymSchema = {
  body: z.object({
    metodoPago: z.enum(['STRIPE', 'EFECTIVO']).optional().default('STRIPE'),
    comentario: z.string().optional(),
  }),
  params: z.object({
    gymId: z.string().regex(/^\d+$/),
  }),
};

/**
 * Schema for enrolling in a class
 */
export const enrollClassSchema = {
  body: z.object({
    comentario: z.string().optional(),
  }),
  params: z.object({
    classScheduleId: z.string().regex(/^\d+$/),
  }),
};

/**
 * Schema for unenrolling from a class
 */
export const unenrollClassSchema = {
  params: z.object({
    classScheduleId: z.string().regex(/^\d+$/),
  }),
};

/**
 * Schema for purchasing a product
 */
export const purchaseProductSchema = {
  body: z.object({
    cantidad: z.number().int().min(1).default(1),
    metodoPago: z.enum(['STRIPE', 'EFECTIVO']).optional().default('STRIPE'),
  }),
  params: z.object({
    productId: z.string().regex(/^\d+$/),
  }),
};

/**
 * Schema for updating user profile
 */
export const updateUserProfileSchema = {
  body: z.object({
    nombre: z.string().min(2).optional(),
    apellido: z.string().min(2).optional(),
    edad: z.number().int().min(0).max(120).optional(),
    sexo: z.enum(['M', 'F', 'O']).optional(),
    foto: z.string().url().optional(),
    latitud: z.number().min(-90).max(90).optional(),
    longitud: z.number().min(-180).max(180).optional(),
  }),
};
