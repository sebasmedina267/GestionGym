import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Demasiados intentos de login. Inténtalo de nuevo en un minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const passwordResetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    status: 429,
    message: 'Demasiadas solicitudes de reseteo de contraseña. Inténtalo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
