import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as pagosController from './pagos.controller.js';
import {
  crearPagoSchema,
  actualizarPagoSchema
} from '../../schemas/pagos.schemas.js';

const router = Router();

router.use(authMiddleware, gymMiddleware);

router.get('/', pagosController.listarPagos);

router.get('/pendientes', pagosController.listarPagosPendientes);

router.get('/estado/:claseId', pagosController.estadoPagosClase);

router.post('/', validate(crearPagoSchema), pagosController.crearPago);

router.patch('/:id', validate(actualizarPagoSchema), pagosController.actualizarPago);

export default router;
