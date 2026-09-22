import Stripe from 'stripe';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { pool } from '../../config/db.js';

// Initialize Stripe SDK with API secret key
const stripe = new Stripe(config.stripeSecretKey);

/**
 * Create a generic payment intent
 * 
 * This is the core function for creating Stripe payment intents. It's called by
 * specific payment functions below (createOwnerSubscriptionPayment, etc).
 * 
 * The amount parameter is expected in cents (smallest currency unit for EUR).
 * Example: 1000 cents = €10.00
 * 
 * @param {number} amount - Payment amount in cents (EUR)
 * @param {string} currency - Currency code (default: 'eur')
 * @param {object} metadata - Additional metadata to attach to the payment
 * @returns {Promise<object>} Stripe payment intent object with client_secret
 * @throws {AppError} If Stripe key is missing or API call fails
 */
export async function createPaymentIntent(amount, currency = 'eur', metadata = {}) {
  // Verify Stripe API key is properly configured
  if (!config.stripeSecretKey || config.stripeSecretKey.includes('tu_clave')) {
    throw new AppError('Stripe Secret Key is not properly configured', 500);
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is integer (cents)
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new AppError('Error creating payment intent: ' + error.message, 500);
  }
}


/**
 * Create a payment intent for gym owner annual subscription
 * 
 * Price: €92.00 per year (9200 cents EUR)
 * Called during first-time owner registration before payment completion.
 * 
 * Metadata attached to payment intent:
 *   - type: 'OWNER_SUBSCRIPTION'
 *   - email, nombre, apellido: Owner information
 *   - gymNombre: Gym name for context
 * 
 * @param {object} ownerData - Owner registration data
 * @param {string} ownerData.email - Owner email address
 * @param {string} ownerData.nombre - Owner first name
 * @param {string} ownerData.apellido - Owner last name
 * @param {string} ownerData.gymNombre - Gym name
 * @returns {Promise<object>} Stripe payment intent object
 */
export async function createOwnerSubscriptionPayment(ownerData) {
  const OWNER_SUBSCRIPTION_PRICE = 9200; // €92 EUR in cents
  
  const metadata = {
    type: 'OWNER_SUBSCRIPTION',
    email: ownerData.email,
    nombre: ownerData.nombre,
    apellido: ownerData.apellido,
    gymNombre: ownerData.gymNombre,
  };

  return await createPaymentIntent(OWNER_SUBSCRIPTION_PRICE, 'eur', metadata);
}


/**
 * Create a payment intent for a new gym branch subscription
 * 
 * Price: €45.00 per year per branch (4500 cents EUR)
 * Called when an existing owner wants to add additional locations/branches.
 * 
 * Metadata attached to payment intent:
 *   - type: 'BRANCH_SUBSCRIPTION'
 *   - ownerId: Owner's database ID
 *   - email: Contact email
 *   - branchName: Name of the new branch
 * 
 * @param {object} branchData - Branch subscription data
 * @param {number} branchData.ownerId - Owner's database ID
 * @param {string} branchData.email - Branch contact email
 * @param {string} branchData.branchName - Name of the new branch
 * @returns {Promise<object>} Stripe payment intent object
 */
export async function createBranchSubscriptionPayment(branchData) {
  const BRANCH_SUBSCRIPTION_PRICE = 4500; // €45 EUR in cents
  
  const metadata = {
    type: 'BRANCH_SUBSCRIPTION',
    ownerId: branchData.ownerId,
    email: branchData.email,
    branchName: branchData.branchName,
  };

  return await createPaymentIntent(BRANCH_SUBSCRIPTION_PRICE, 'eur', metadata);
}


/**
 * Retrieve payment intent details from Stripe
 * 
 * Fetches current status and information about a specific payment intent.
 * Useful for verifying payment status after user-initiated actions.
 * 
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<object>} Payment intent object from Stripe
 * @throws {AppError} If payment intent not found or API error occurs
 */
export async function getPaymentIntent(paymentIntentId) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new AppError('Error retrieving payment details', 500);
  }
}

/**
 * Check if a payment intent was successfully processed
 * 
 * Simple utility function to verify payment completion.
 * Returns false gracefully on error (doesn't throw).
 * 
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<boolean>} True if payment status is 'succeeded', false otherwise
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
 * Create a Stripe customer record
 * 
 * This function creates a customer profile in Stripe for a new gym owner.
 * Useful for future recurring billing and customer management.
 * 
 * Metadata includes:
 *   - type: 'GYM_OWNER' (identifies user type)
 *   - All user data for reference
 * 
 * @param {object} userData - User information
 * @param {string} userData.email - Customer email
 * @param {string} userData.nombre - Customer first name
 * @param {string} userData.apellido - Customer last name
 * @returns {Promise<object>} Stripe customer object with ID
 * @throws {AppError} If creation fails
 * 
 * TODO: This function is currently unused. Consider removing if not needed
 *       or integrate with payment intent creation.
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
    throw new AppError('Error creating Stripe customer', 500);
  }
}


/**
 * Verify and extract Stripe webhook event
 * 
 * This function validates that a webhook request actually came from Stripe
 * by verifying the HMAC signature using Stripe's webhook secret key.
 * 
 * Security: This is critical for preventing fake webhook calls that could
 * trick the system into confirming payments that didn't actually occur.
 * 
 * @param {string|Buffer} body - Raw webhook request body (not JSON parsed)
 * @param {string} signature - Value from 'stripe-signature' HTTP header
 * @returns {Promise<object>} Parsed webhook event object
 * @throws {AppError} If signature is invalid or doesn't match
 * 
 * IMPORTANT: This function expects raw body, not parsed JSON.
 *            Express must be configured with raw body parser for /webhook endpoint.
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
    throw new AppError('Invalid webhook signature', 401);
  }
}

/**
 * Create a payment intent for client membership/cuota checkout
 */
export async function createMembershipCheckoutPayment({ pagoId, clientEmail, clientId, isNative }) {
  const pagoId_num = Number(pagoId);
  if (isNaN(pagoId_num)) throw new AppError('Invalid payment ID', 400);

  // Fetch the payment details from database
  const [pagoRows] = await pool.query(
    `SELECT p.*, c.email as client_email, c.nombre, c.apellido 
     FROM pagos p
     JOIN clientes c ON c.id = p.cliente_id
     WHERE p.id = ?`,
    [pagoId_num]
  );

  const pago = pagoRows[0];
  if (!pago) {
    throw new AppError('Payment record not found', 404);
  }

  if (pago.pagado) {
    throw new AppError('This payment is already settled', 400);
  }

  // Security Check: Verify that this payment belongs to the authenticated client
  if (isNative) {
    if (pago.cliente_id !== clientId) {
      throw new AppError('Access Denied: This payment does not belong to you', 403);
    }
  } else {
    if (pago.client_email !== clientEmail) {
      throw new AppError('Access Denied: This payment does not belong to you', 403);
    }
  }

  const amountCents = Math.round(pago.importe * 100);

  const metadata = {
    type: 'CLIENT_MEMBERSHIP',
    pagoId: String(pago.id),
    clienteId: String(pago.cliente_id),
    gymId: String(pago.gym_id),
    importe: String(pago.importe)
  };

  const paymentIntent = await createPaymentIntent(amountCents, 'eur', metadata);
  paymentIntent.description = `Membership Payment - ${pago.nombre} ${pago.apellido}`;
  return paymentIntent;
}

/**
 * Atomically marks a membership payment as paid and registers the income in economy.
 * Called automatically from the Stripe webhook when a payment intent succeeds.
 */
export async function settleMembershipPayment(pagoId, gymId, clienteId, importe) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Mark payment as paid, set method to TARJETA and set date
    await conn.query(
      `UPDATE pagos 
       SET pagado = TRUE, 
           metodo_pago = 'TARJETA', 
           fecha_pago = CURRENT_DATE 
       WHERE id = ?`,
      [pagoId]
    );

    // Insert corresponding income transaction in the economy ledger
    await conn.query(
      `INSERT INTO ingresos (gym_id, fuente_tipo, fuente_id, descripcion, importe, fecha, admin_id)
       VALUES (?, 'PAGO_CLIENTE', ?, ?, ?, CURRENT_DATE, NULL)`,
      [
        gymId,
        pagoId,
        `Stripe payment from client ID ${clienteId}`,
        importe
      ]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
