import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";
export const UPLOADS_URL = "http://localhost:4000/uploads";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "null" && token !== "undefined" && token !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Obtener gym ID desde localStorage
  const gymId = localStorage.getItem("gym_id") || sessionStorage.getItem("gym_id");
  if (gymId && gymId !== "null" && gymId !== "undefined" && gymId !== "") {
    config.headers["x-gym-id"] = Number(gymId);
  }

  return config;
});

export default api;
