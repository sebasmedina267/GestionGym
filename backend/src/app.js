import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorMiddleware } from './middlewares/error.middleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { gymMiddleware } from './middlewares/gym.middleware.js';
import { auditMiddleware } from './middlewares/audit.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import adminsRoutes from './modules/admins/admins.routes.js';
import gymsRoutes from './modules/gyms/gyms.routes.js';
import clientesRoutes from './modules/clientes/clientes.routes.js';
import clasesRoutes from './modules/clases/clases.routes.js';
import maquinasRoutes from './modules/maquinas/maquinas.routes.js';
import productosRoutes from './modules/productos/productos.routes.js';
import pagosRoutes from './modules/pagos/pagos.routes.js';
import economiaRoutes from './modules/economia/economia.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import stripeRoutes from './modules/stripe/stripe.routes.js';

const app = express();

// Middleware para Stripe Webhook (raw body - ANTES de JSON parsing)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

app.use('/api/admins', authMiddleware, gymMiddleware, auditMiddleware, adminsRoutes);
app.use('/api/gyms', authMiddleware, gymsRoutes);
app.use('/api/clientes', authMiddleware, gymMiddleware, auditMiddleware, clientesRoutes);
app.use('/api/clases', authMiddleware, gymMiddleware, auditMiddleware, clasesRoutes);
app.use('/api/maquinas', authMiddleware, gymMiddleware, auditMiddleware, maquinasRoutes);
app.use('/api/productos', authMiddleware, gymMiddleware, auditMiddleware, productosRoutes);
app.use('/api/pagos', authMiddleware, gymMiddleware, auditMiddleware, pagosRoutes);
app.use('/api/economia', authMiddleware, gymMiddleware, auditMiddleware, economiaRoutes);
app.use('/api/audit', auditRoutes);

app.use(errorMiddleware);

export default app;
