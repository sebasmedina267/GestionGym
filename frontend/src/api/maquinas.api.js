import api from "./axios";

export const getMaquinasByGym = (gymId) =>
  api.get(`/maquinas?gymId=${gymId}`);

export const createMaquina = (data) => api.post("/maquinas", data);

export const updateMaquina = (id, data) =>
  api.put(`/maquinas/${id}`, data);

export const deleteMaquina = (id) => api.delete(`/maquinas/${id}`);
