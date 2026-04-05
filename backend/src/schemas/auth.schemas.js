import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un símbolo");

export const registerOwnerSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    password: passwordSchema,
    gymNombre: z.string().min(2),
    gymDireccion: z.string().optional(),
  }),
};

export const registerEmployeeSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    password: passwordSchema,
    gymId: z.union([z.number().int().positive(), z.string().transform(Number).pipe(z.number().int().positive())]),
  }),
};

export const loginSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    password: z.string().min(1),
  }),
};

export const passwordResetRequestSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    newPassword: passwordSchema,
  }),
};

export const passwordResetSchema = {
  body: z.object({
    token: z.string().min(10),
  }),
};
