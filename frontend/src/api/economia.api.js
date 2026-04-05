import api from "./axios";

export const getEconomiaByGym = (gymId) =>
  api.get(`/economia/resumen?gymId=${gymId}`);
