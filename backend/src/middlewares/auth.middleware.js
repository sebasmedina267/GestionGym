import { verifyToken } from '../utils/jwt.js';
import * as authRepository from '../modules/auth/auth.repository.js';

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token);

    // Cargar los gyms del admin
    const gyms = await authRepository.getGymsByAdminId(payload.id);

    req.admin = {
      ...payload,
      gyms: gyms.map(g => g.id)
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
