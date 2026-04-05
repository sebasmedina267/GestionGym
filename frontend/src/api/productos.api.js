import api from "./axios";

export const getProductosByGym = (gymId) =>
  api.get(`/productos?gymId=${gymId}`);

export const createProducto = (data) => api.post("/productos", data);

export const updateProducto = (id, data) =>
  api.put(`/productos/${id}`, data);

export const deleteProducto = (id) => api.delete(`/productos/${id}`);
