import api from "./axios";

export const getPagosByGym = (gymId) =>
  api.get(`/pagos?gymId=${gymId}`);

export const getPagosPendientes = (gymId) =>
  api.get(`/pagos/pendientes?gymId=${gymId}`);

export const getPagosEstado = (claseId, mes) =>
  api.get(`/pagos/estado/${claseId}?mes=${mes}`);

export const createPago = (data) => api.post("/pagos", data);

export const updatePago = (id, data) => api.patch(`/pagos/${id}`, data);
