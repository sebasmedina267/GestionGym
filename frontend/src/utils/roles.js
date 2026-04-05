export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  EMPLEADO: "empleado",
};

export function hasRole(admin, role) {
  if (!admin) return false;
  return admin.rol === role;
}

export function hasAnyRole(admin, roles = []) {
  if (!admin) return false;
  return roles.includes(admin.rol);
}
