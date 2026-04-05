import api from "./axios";

export const getAllGyms = () => api.get("/gyms");

export const createGym = (data) => api.post("/gyms/create", data);

export const updateGym = (gymId, data) => api.patch(`/gyms/${gymId}`, data);

export const getGymsByAdmin = () => api.get("/gyms");

export const assignGym = (gymId) => api.post("/gyms/assign-gym", { gymId });

