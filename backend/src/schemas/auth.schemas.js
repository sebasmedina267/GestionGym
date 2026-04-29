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
    email: z.string().email(),
    password: passwordSchema,
    gymNombre: z.string().min(2),
    gymDireccion: z.string().optional(),
    gymUrlWeb: z.string().optional(),
    gymFoto: z.string().optional(),
  }),
};

export const registerEmployeeSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    email: z.string().email(),
    password: passwordSchema,
    gymId: z.union([z.number().int().positive(), z.string().transform(Number).pipe(z.number().int().positive())]),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

export const passwordResetRequestSchema = {
  body: z.object({
    email: z.string().email(),
  }),
};

export const passwordResetSchema = {
  body: z.object({
    token: z.string().min(10),
    newPassword: passwordSchema,
  }),
};

export const registerUserFinalSchema = {
  body: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    email: z.string().email(),
    password: passwordSchema,
  }),
};

export const enrollGymSchema = {
  body: z.object({
    gymId: z.union([z.number().int().positive(), z.string().transform(Number).pipe(z.number().int().positive())]),
    metodo_pago: z.enum(["APP", "EFECTIVO", "TARJETA"]).optional(),
  }),
};
