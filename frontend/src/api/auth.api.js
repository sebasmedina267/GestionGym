import api from "./axios";

export const loginRequest = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerSuperadminRequest = (data) =>
  api.post("/auth/register-superadmin", data);

export const registerOwnerRequest = (data) =>
  api.post("/auth/register-owner", data);

export const passwordResetRequest = (email) =>
  api.post("/auth/password-reset-request", { email });

export const passwordReset = (token, newPassword) =>
  api.post("/auth/password-reset", { token, newPassword });