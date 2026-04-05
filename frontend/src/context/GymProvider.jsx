import { useState, useEffect } from "react";
import { GymContext } from "./GymContext";
import api from "../api/axios";

export function GymProvider({ children }) {
  const [gym, setGym] = useState(() => {
    try {
      const stored = localStorage.getItem("gym");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Establecer header al montar (si gym existe desde localStorage)
  useEffect(() => {
    if (gym?.id) {
      api.defaults.headers.common["x-gym-id"] = gym.id;
    }
  }, []);

  // Actualizar header cuando gym cambia
  useEffect(() => {
    if (gym) {
      localStorage.setItem("gym", JSON.stringify(gym));
      localStorage.setItem("gym_id", gym.id);
      api.defaults.headers.common["x-gym-id"] = gym.id;
    }
  }, [gym]);

  return (
    <GymContext.Provider value={{ gym, setGym }}>
      {children}
    </GymContext.Provider>
  );
}
