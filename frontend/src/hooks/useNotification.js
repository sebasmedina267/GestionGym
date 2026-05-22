import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

/**
 * useNotification Hook
 * 
 * Provides easy access to notification system.
 * 
 * Usage:
 * const { success, error, warning, info } = useNotification();
 * 
 * success("Operación completada!");
 * error("Algo salió mal");
 */
export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification debe ser usado dentro de NotificationProvider"
    );
  }

  const { addNotification } = context;

  return {
    success: (message, duration) =>
      addNotification(message, "success", duration || 3000),
    error: (message, duration) =>
      addNotification(message, "error", duration || 5000),
    warning: (message, duration) =>
      addNotification(message, "warning", duration || 4000),
    info: (message, duration) =>
      addNotification(message, "info", duration || 4000),
  };
}
