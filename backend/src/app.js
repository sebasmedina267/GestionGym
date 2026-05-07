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

/**
 * FitFlow Management Engine - Application Orchestrator
 * 
 * This module initializes the Express application, configures global middlewares, 
 * defines high-fidelity routing structures, and establishes the error handling pipeline.
 * 
 * Features:
 * - Strategic middleware layering (CORS, JSON Parsing, Logging).
 * - Specialized raw body handling for Stripe Webhooks.
 * - Dynamic static asset serving for gym assets.
 * - Multi-tiered routing (Public vs. Authenticated vs. Scoped).
 * - Centralized Audit telemetry integration.
 */
const app = express();

/**
 * STRIPE WEBHOOK INTEGRITY
 * MUST be registered before express.json() to preserve the raw request body 
 * required for HMAC signature verification.
 */
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// SECURITY & UTILITY MIDDLEWARES
app.use(cors()); // Enable cross-origin resource sharing for the frontend
app.use(express.json()); // Standard JSON payload parsing
app.use(morgan('dev')); // Performance and request telemetry logging

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * STATIC ASSET INFRASTRUCTURE
 * Provides high-speed access to uploaded gym branding and member photos.
 */
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

/**
 * ========================
 * PUBLIC API REGISTRY
 * ========================
 * Accessible without session tokens. Handles onboarding and payment gateways.
 */
app.use('/api/auth', authRoutes); // Registration & Authentication
app.use('/api/stripe', stripeRoutes); // Payment Intent Management

/**
 * ========================
 * PROTECTED API REGISTRY
 * ========================
 * Enforces a strict triple-security middleware stack:
 * 1. authMiddleware: Identity verification (JWT).
 * 2. gymMiddleware: Operational branch scoping (x-gym-id).
 * 3. auditMiddleware: Automated telemetry capture.
 */

// Staff & Human Resources
app.use('/api/admins', authMiddleware, gymMiddleware, auditMiddleware, adminsRoutes);

// Organization & Branch Infrastructure
app.use('/api/gyms', authMiddleware, gymsRoutes);

// Member Registry & CRM
app.use('/api/clientes', authMiddleware, gymMiddleware, auditMiddleware, clientesRoutes);

// Scheduling & Curriculum
app.use('/api/clases', authMiddleware, gymMiddleware, auditMiddleware, clasesRoutes);

// Physical Capital & Asset Management
app.use('/api/maquinas', authMiddleware, gymMiddleware, auditMiddleware, maquinasRoutes);

// Retail & Inventory Supply Chain
app.use('/api/productos', authMiddleware, gymMiddleware, auditMiddleware, productosRoutes);

// Financial Ledger & Collections
app.use('/api/pagos', authMiddleware, gymMiddleware, auditMiddleware, pagosRoutes);

// Business Intelligence & Fiscal Reporting
app.use('/api/economia', authMiddleware, gymMiddleware, auditMiddleware, economiaRoutes);

// System Audit Logs
app.use('/api/audit', auditRoutes);

/**
 * ========================
 * GLOBAL ERROR HANDLING
 * ========================
 * Final pipeline segment that captures all exceptions and provides formatted 
 * technical responses to the client.
 */
app.use(errorMiddleware);

export default app;
