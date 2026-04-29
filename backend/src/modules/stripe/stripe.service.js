import Stripe from 'stripe';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const stripe = new Stripe(config.stripeSecretKey);

/**
 * CREAR PAYMENT INTENT GENÉRICO
 * @param {number} amount In cents
 */
export async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  if (!config.stripeSecretKey || config.stripeSecretKey.includes('tu_clave')) {
    throw new AppError('Stripe Secret Key no configurada correctamente', 500);
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ya viene en centavos
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new AppError('Error al crear intent de pago: ' + error.message, 500);
  }
}

/**
 * CREAR PAYMENT INTENT PARA SUSCRIPCIÓN DUEÑO
 * Precio: $99 USD por suscripción anual
 */
export async function createOwnerSubscriptionPayment(ownerData) {
  const OWNER_SUBSCRIPTION_PRICE = 9900; // $99 USD
  
  const metadata = {
    type: 'OWNER_SUBSCRIPTION',
    email: ownerData.email,
    nombre: ownerData.nombre,
    apellido: ownerData.apellido,
    gymNombre: ownerData.gymNombre,
  };

  return await createPaymentIntent(OWNER_SUBSCRIPTION_PRICE, 'usd', metadata);
}

/**
 * CREAR PAYMENT INTENT PARA NUEVA SUCURSAL
 * Precio: $49 USD por sucursal anual
 */
export async function createBranchSubscriptionPayment(branchData) {
  const BRANCH_SUBSCRIPTION_PRICE = 4900; // $49 USD
  
  const metadata = {
    type: 'BRANCH_SUBSCRIPTION',
    ownerId: branchData.ownerId,
    email: branchData.email,
    branchName: branchData.branchName,
  };

  return await createPaymentIntent(BRANCH_SUBSCRIPTION_PRICE, 'usd', metadata);
}

/**
 * OBTENER DETALLES DE PAYMENT INTENT
 */
export async function getPaymentIntent(paymentIntentId) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new AppError('Error al obtener detalles del pago', 500);
  }
}

/**
 * VERIFICAR SI PAGO FUE EXITOSO
 */
export async function isPaymentSuccessful(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

/**
 * CREAR CUSTOMER EN STRIPE
 */
export async function createStripeCustomer(userData) {
  try {
    const customer = await stripe.customers.create({
      email: userData.email,
      name: `${userData.nombre} ${userData.apellido}`,
      metadata: {
        type: 'GYM_OWNER',
        ...userData,
      },
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new AppError('Error al crear cliente en Stripe', 500);
  }
}

/**
 * VERIFICAR WEBHOOK DE STRIPE
 */
export async function verifyWebhookSignature(body, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripeWebhookSecret
    );
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new AppError('Firma de webhook inválida', 401);
  }
}
