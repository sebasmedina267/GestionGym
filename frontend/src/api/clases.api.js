import api from "./axios";

// CLASES
export const getClases = () => api.get("/clases");

export const createClase = (data) => api.post("/clases", data);

export const updateClase = (id, data) => api.patch(`/clases/${id}`, data);

export const deleteClase = (id) => api.delete(`/clases/${id}`);

// MONITORES
export const getMonitores = (claseId) =>
  api.get(`/clases/${claseId}/monitores`);

export const agregarMonitor = (claseId, monitorId) =>
  api.post(`/clases/${claseId}/monitores`, { admin_id: monitorId });

export const removerMonitor = (claseId, monitorId) =>
  api.delete(`/clases/${claseId}/monitores/${monitorId}`);

// PRECIOS
export const getPrecios = (claseId) =>
  api.get(`/clases/${claseId}/precios`);

export const createPrecio = (claseId, data) =>
  api.post(`/clases/${claseId}/precios`, data);

export const updatePrecio = (precioId, data) =>
  api.patch(`/clases/precios/${precioId}`, data);

export const deletePrecio = (precioId) =>
  api.delete(`/clases/precios/${precioId}`);

// HORARIOS
export const getHorarios = (claseId) =>
  api.get(`/clases/${claseId}/horarios`);

export const createHorario = (claseId, data) =>
  api.post(`/clases/${claseId}/horarios`, data);

export const updateHorario = (horarioId, data) =>
  api.patch(`/clases/horarios/${horarioId}`, data);

export const deleteHorario = (horarioId) =>
  api.delete(`/clases/horarios/${horarioId}`);

// CLIENTES EN HORARIO
export const getClientesDeHorario = (horarioId) =>
  api.get(`/clases/horarios/${horarioId}/clientes`);

export const inscribirCliente = (horarioId, clienteId) =>
  api.post(`/clases/horarios/${horarioId}/clientes/${clienteId}`);

export const desinscribirCliente = (horarioId, clienteId) =>
  api.delete(`/clases/horarios/${horarioId}/clientes/${clienteId}`);

// STATS
export const getStatsClase = (claseId) =>
  api.get(`/clases/${claseId}/stats`);

export const getClasesConCurrencia = () =>
  api.get(`/clases/stats/concurrencia`);