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

router.use(authMiddleware, gymMiddleware);

router.get('/resumen', economiaController.resumenEconomico);

router.post('/ingresos', validate(crearIngresoSchema), economiaController.crearIngresoManual);

router.post('/gastos', validate(crearGastoSchema), economiaController.crearGastoManual);

router.get('/ingresos', economiaController.listarIngresos);

router.get('/gastos', economiaController.listarGastos);

export default router;
