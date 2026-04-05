import { useContext } from "react";
import { GymContext } from "../context/GymContext";

export function useGym() {
  return useContext(GymContext);
}
