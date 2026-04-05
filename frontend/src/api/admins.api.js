import api from "./axios";

export const getAllAdmins = () => api.get("/admins/all");

export const createAdmin = (data) => api.post("/admins", data);
