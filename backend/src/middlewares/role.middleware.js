export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const roles = req.admin?.roles || [];
    const ok = roles.some(r => rolesPermitidos.includes(r));
    if (!ok) {
      return res.status(403).json({ message: 'No tienes permisos suficientes' });
    }
    next();
  };
}