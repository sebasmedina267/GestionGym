import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function errorMiddleware(err, req, res, next) {
  console.error("ERROR:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      message: "Datos inválidos",
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      status: 400,
      message: "Registro duplicado",
    });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      status: 400,
      message: "Referencia inválida",
    });
  }

  return res.status(500).json({
    status: 500,
    message: "Error interno del servidor",
  });
}
