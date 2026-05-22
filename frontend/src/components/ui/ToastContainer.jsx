import React, { useContext } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import Toast from "./Toast";
import "./Toast.css";

/**
 * ToastContainer Component
 * 
 * Renders all active toast notifications.
 * Place this component high in the component tree (typically in App.jsx or main layout).
 */
export default function ToastContainer() {
  const { notifications, removeNotification } = useContext(NotificationContext);

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
