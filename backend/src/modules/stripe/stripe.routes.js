import { Router } from 'express';
import * as stripeController from './stripe.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// Pago genérico
router.post('/create-payment-intent', stripeController.createPaymentIntent);

// Pago para suscripción de Dueño (sin autenticación requerida - es parte del registro)
router.post('/owner-subscription', stripeController.createOwnerSubscriptionPayment);

// Pago para nueva sucursal (requiere autenticación)
router.post('/branch-subscription', authMiddleware, stripeController.createBranchSubscriptionPayment);

// Verificar estado de pago
router.post('/verify-payment', stripeController.verifyPaymentIntent);

// Webhook de Stripe (sin auth)
router.post('/webhook', stripeController.handleStripeWebhook);

export default router;
