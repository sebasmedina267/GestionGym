import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { gymMiddleware } from '../../middlewares/gym.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

import * as productosController from './productos.controller.js';
import {
  crearProductoSchema,
  actualizarProductoSchema,
  compraVentaSchema
} from '../../schemas/productos.schemas.js';

import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware, gymMiddleware);

router.get('/', productosController.listarProductos);
router.get('/movimientos', productosController.listarMovimientos);
router.get('/stats', productosController.estadisticasProductos);

router.post('/', upload.single('foto'), validate(crearProductoSchema), productosController.crearProductoBase);

router.patch('/:id', upload.single('foto'), validate(actualizarProductoSchema), productosController.actualizarProducto);

router.post('/:id/compra', validate(compraVentaSchema), productosController.registrarCompra);

router.post('/:id/venta', validate(compraVentaSchema), productosController.registrarVenta);

export default router;
