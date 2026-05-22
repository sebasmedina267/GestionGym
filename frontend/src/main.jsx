import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { GymProvider } from "./context/GymProvider.jsx";
import { UIProvider } from "./context/UIProvider.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GymProvider>
        <UIProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </UIProvider>
      </GymProvider>
    </AuthProvider>
  </StrictMode>,
)
