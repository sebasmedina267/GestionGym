import * as stripeService from './stripe.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Create a generic payment intent
 * 
 * This endpoint allows external services to create payment intents for custom amounts.
 * The amount should be provided in cents (e.g., 1000 = €10.00).
 * 
 * Request body:
 *   - amount: {number} Payment amount in cents
 *   - metadata: {object} Optional metadata to attach to the payment
 * 
 * Response:
 *   - clientSecret: Stripe client secret for completing payment on frontend
 *   - paymentIntentId: Unique Stripe payment intent identifier
 * 
 * Errors:
 *   - 400: Invalid amount (missing or <= 0)
 *   - 500: Stripe API error
 */
export async function createPaymentIntent(req, res, next) {
  try {
    const { amount, metadata = {} } = req.body;
    
    // Validate that amount is a positive number
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const paymentIntent = await stripeService.createPaymentIntent(amount, 'eur', metadata);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Create a payment intent for gym owner subscription
 * 
 * This endpoint handles the first-time subscription payment during owner registration.
 * Price: €92.00/year (9200 cents in EUR)
 * No authentication required (part of registration flow)
 * 
 * Request body:
 *   - nombre: {string} Owner's first name
 *   - apellido: {string} Owner's last name
 *   - email: {string} Owner's email address
 *   - gymNombre: {string} Gym name for the account
 * 
 * Response:
 *   - clientSecret: Required to complete payment on frontend
 *   - paymentIntentId: For tracking and webhook events
 *   - amount: 9200 (cents)
 *   - description: Human-readable payment description
 * 
 * Errors:
 *   - 400: Missing required fields
 *   - 500: Stripe API error
 */
export async function createOwnerSubscriptionPayment(req, res, next) {
  try {
    const { nombre, apellido, email, gymNombre } = req.body;

    // Validate all required fields are provided
    if (!nombre || !apellido || !email || !gymNombre) {
      throw new AppError('Incomplete data for subscription creation', 400);
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
      amount: 9200,
      description: 'Annual Subscription - Gym Owner',
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Create a payment intent for a new branch subscription
 * 
 * Allows an existing gym owner to add additional branches/locations.
 * Price: €45.00/year per branch (4500 cents in EUR)
 * Requires authentication (owner role)
 * 
 * Request body:
 *   - ownerId: {number} Optional owner ID (defaults to authenticated user)
 *   - email: {string} Branch contact email
 *   - branchName: {string} Name of the new branch
 * 
 * Response:
 *   - clientSecret: For frontend payment completion
 *   - paymentIntentId: For tracking
 *   - amount: 4500 (cents)
 *   - description: Human-readable payment description
 * 
 * Errors:
 *   - 401: Not authenticated
 *   - 403: User is not a gym owner
 *   - 400: Missing required fields
 *   - 500: Stripe API error
 * 
 * Security: User must be authenticated with DUENO role
 */
export async function createBranchSubscriptionPayment(req, res, next) {
  try {
    // Verify user is authenticated
    if (!req.admin) throw new AppError('Not authenticated', 401);

    const { ownerId, email, branchName } = req.body;

    // Only owners can create branches
    if (!req.admin.roles.includes('DUENO')) {
      throw new AppError('Only owners can create branches', 403);
    }

    const paymentIntent = await stripeService.createBranchSubscriptionPayment({
      ownerId: ownerId || req.admin.id,
      email,
      branchName,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: 4500,
      description: 'Annual Subscription - New Branch',
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Verify the status of a payment intent
 * 
 * Allows clients to check whether a payment has been successfully processed.
 * Useful for frontend polling and payment confirmation workflows.
 * 
 * Request body:
 *   - paymentIntentId: {string} Stripe payment intent ID
 * 
 * Response:
 *   - status: Current status (succeeded, requires_action, processing, etc)
 *   - isSuccessful: Boolean flag for easy checking
 *   - paymentIntentId: Echo of request ID
 *   - metadata: Original metadata attached to the payment
 * 
 * Errors:
 *   - 400: Missing paymentIntentId
 *   - 500: Stripe API error
 */
export async function verifyPaymentIntent(req, res, next) {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      throw new AppError('Payment Intent ID required', 400);
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
 * Handle Stripe webhook events
 * 
 * This endpoint receives and processes events from Stripe. It's called by Stripe's
 * servers when payment-related events occur (successful payments, failed attempts, etc).
 * 
 * Important: This endpoint expects a raw request body (not parsed JSON) and must verify
 * the webhook signature to ensure the request is authentic from Stripe.
 * 
 * Supported events:
 *   - payment_intent.succeeded: Payment completed successfully
 *   - payment_intent.payment_failed: Payment attempt failed
 *   - Other events are logged but not processed
 * 
 * Request headers:
 *   - stripe-signature: HMAC signature for webhook verification
 * 
 * Response:
 *   - 200 & { received: true }: Event received and processed
 *   - 400: Missing signature or signature verification failed
 * 
 * Security: Signature validation prevents unauthorized webhook calls
 * Note: Current implementation only logs events. Event processing should be
 *       handled by the frontend (confirmOwnerRegistrationAfterPayment endpoint)
 */
export async function handleStripeWebhook(req, res, next) {
  try {
    const signature = req.headers['stripe-signature'];
    
    // Stripe signature is mandatory for security
    if (!signature) {
      return res.status(400).json({ error: 'Missing webhook signature' });
    }

    // Convert buffer to string if needed (Express raw body returns Buffer)
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      body = body.toString('utf-8');
    }
    
    // Verify webhook signature with Stripe secret key
    const event = await stripeService.verifyWebhookSignature(body, signature);

    // Process different types of Stripe events
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object.id);
        console.log('   Metadata:', event.data.object.metadata);
        // Frontend confirms payment in the /confirm-owner-payment endpoint
        break;
      
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Always return success to Stripe (prevents retries)
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Return 400 to Stripe for retries, but don't expose error details
    res.status(400).json({ error: 'webhook_error' });
  }
}
