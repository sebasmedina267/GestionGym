import React, { useCallback, useState } from "react";
import { NotificationContext } from "./NotificationContext.js";

/**
 * NotificationProvider Component
 * 
 * Manages global notification state for toast messages.
 * Supports different types: success, error, warning, info
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      const notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
