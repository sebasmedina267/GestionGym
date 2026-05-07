import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as economiaController from './economia.controller.js';
import {
  crearIngresoSchema,
  crearGastoSchema
} from '../../schemas/economia.schemas.js';

const router = Router();

/**
 * Economy & Financial Routes
 * 
 * Orchestrates all financial operations for a specific gym branch, including:
 * - High-level financial summaries (Revenue vs Expenses).
 * - Manual income registration (e.g., direct sales).
 * - Expense tracking (e.g., maintenance, utilities).
 * - Historical transaction listings.
 * 
 * Requires active authentication and a specific gym branch context.
 */

// All routes are protected by session and gym branch validation
router.use(authMiddleware, gymMiddleware);

/** 
 * Financial Summary
 * Retrieves aggregate data for revenue, expenses, and profitability metrics.
 */
router.get('/resumen', economiaController.resumenEconomico);

/** 
 * Manual Income Registration
 * Records miscellaneous income not processed through automated payment modules.
 */
router.post('/ingresos', validate(crearIngresoSchema), economiaController.crearIngresoManual);

/** 
 * Expense Registration
 * Records facility costs, maintenance, and other operational expenses.
 */
router.post('/gastos', validate(crearGastoSchema), economiaController.crearGastoManual);

/** 
 * Income Listing
 * Retrieves a historical list of all income transactions for the branch.
 */
router.get('/ingresos', economiaController.listarIngresos);

/** 
 * Expense Listing
 * Retrieves a historical list of all recorded expenses for the branch.
 */
router.get('/gastos', economiaController.listarGastos);

export default router;
