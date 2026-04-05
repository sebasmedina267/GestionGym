import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as maquinasController from './maquinas.controller.js';
import {
  crearMaquinaSchema,
  actualizarMaquinaSchema
} from '../../schemas/maquinas.schemas.js';

import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware, gymMiddleware);

router.get('/', maquinasController.listarMaquinas);

router.post('/', upload.single('imagen'), validate(crearMaquinaSchema), maquinasController.crearMaquina);

router.patch('/:id', upload.single('imagen'), validate(actualizarMaquinaSchema), maquinasController.actualizarMaquina);

router.delete('/:id', maquinasController.eliminarMaquina);

export default router;
