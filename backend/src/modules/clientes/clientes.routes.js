import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as clientesController from './clientes.controller.js';
import {
  crearClienteSchema,
  actualizarClienteSchema,
  eliminarClienteSchema
} from '../../schemas/clientes.schemas.js';

const router = Router();

router.use(authMiddleware, gymMiddleware);

router.get('/', clientesController.listarClientes);
router.get('/stats', clientesController.estadisticasClientes);

router.post('/', validate(crearClienteSchema), clientesController.crearCliente);

router.patch('/:id', validate(actualizarClienteSchema), clientesController.actualizarCliente);

router.delete('/:id', validate(eliminarClienteSchema), clientesController.eliminarCliente);

export default router;
