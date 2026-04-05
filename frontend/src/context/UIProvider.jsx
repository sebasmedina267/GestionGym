import { useState } from "react";
import { UIContext } from "./UIContext";

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </UIContext.Provider>
  );
}
