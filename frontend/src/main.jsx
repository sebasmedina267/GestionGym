import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { GymProvider } from "./context/GymProvider.jsx";
import { UIProvider } from "./context/UIProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GymProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </GymProvider>
    </AuthProvider>
  </StrictMode>,
)
