export function gymMiddleware(req, res, next) {
  const gymId = Number(req.headers['x-gym-id']);

  if (!gymId) {
    return res.status(400).json({ message: 'Debes seleccionar un gym' });
  }

  if (!req.admin?.gyms?.includes(gymId)) {
    return res.status(403).json({ message: 'No tienes acceso a este gym' });
  }

  req.gym = { id: gymId };
  next();
}