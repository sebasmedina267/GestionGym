import * as stripeService from './stripe.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * CREAR PAYMENT INTENT GENÉRICO
 */
export async function createPaymentIntent(req, res, next) {
  try {
    const { amount, metadata = {} } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto debe ser mayor a 0' });
    }

    const paymentIntent = await stripeService.createPaymentIntent(amount, 'usd', metadata);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * CREAR PAYMENT INTENT PARA SUSCRIPCIÓN DE DUEÑO
 * Retorna client_secret para completar el pago en frontend
 */
export async function createOwnerSubscriptionPayment(req, res, next) {
  try {
    const { nombre, apellido, email, gymNombre } = req.body;

    if (!nombre || !apellido || !email || !gymNombre) {
      throw new AppError('Datos incompletos para crear suscripción', 400);
    }

    const paymentIntent = await stripeService.createOwnerSubscriptionPayment({
      nombre,
      apellido,
      email,
      gymNombre,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: 9900,
      description: 'Suscripción Anual - Dueño de Gimnasio',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * CREAR PAYMENT INTENT PARA NUEVA SUCURSAL
 * Solo para dueños que ya existen
 */
export async function createBranchSubscriptionPayment(req, res, next) {
  try {
    if (!req.admin) throw new AppError('No autenticado', 401);

    const { ownerId, email, branchName } = req.body;

    // Validar que sea dueño
    if (!req.admin.roles.includes('DUENO')) {
      throw new AppError('Solo dueños pueden crear sucursales', 403);
    }

    const paymentIntent = await stripeService.createBranchSubscriptionPayment({
      ownerId: ownerId || req.admin.id,
      email,
      branchName,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: 4900,
      description: 'Suscripción Anual - Nueva Sucursal',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * VERIFICAR ESTADO DE PAYMENT INTENT
 */
export async function verifyPaymentIntent(req, res, next) {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      throw new AppError('Payment Intent ID requerido', 400);
    }

    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      isSuccessful: paymentIntent.status === 'succeeded',
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * WEBHOOK DE STRIPE
 * Procesa eventos de Stripe (payment_intent.succeeded, etc)
 * NOTA: req.body es raw buffer, se convierte a string
 */
export async function handleStripeWebhook(req, res, next) {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Firma de webhook faltante' });
    }

    // req.body debería ser buffer (raw), convertir a string
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      body = body.toString('utf-8');
    }
    
    const event = await stripeService.verifyWebhookSignature(body, signature);

    // Procesar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object.id);
        console.log('   Metadata:', event.data.object.metadata);
        // El frontend confirmará el pago en la ruta /confirm-owner-payment
        break;
      
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Retornar 400 a Stripe para reintentos, pero sin exponer detalles
    res.status(400).json({ error: 'webhook_error' });
  }
}
