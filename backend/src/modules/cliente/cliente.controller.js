/**
 * Client Dashboard Controller
 * 
 * Request handlers for client-specific endpoints.
 * Handles validation, calls service layer, and formats responses.
 */

import * as clienteService from './cliente.service.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Verify request has authenticated user context
 */
function validarUsuario(req) {
  if (!req.admin || !req.admin) {
    throw new AppError('Authentication required', 401);
  }
}

/**
 * Validate ID parameter
 */
function validarId(id, nombre = 'ID') {
  const num = Number(id);
  if (isNaN(num) || num <= 0) {
    throw new AppError(`Invalid ${nombre}`, 400);
  }
  return num;
}

/* ============================================================
   GYM AFFILIATION
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms
 */
export async function getMyGyms(req, res, next) {
  try {
    validarUsuario(req);
    const gyms = await clienteService.getMyGyms(req.admin);
    res.status(200).json({
      ok: true,
      data: gyms,
      count: gyms.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/client/dashboard/my-gyms/:gymId
 */
export async function getMyGymDetails(req, res, next) {
  try {
    validarUsuario(req);
    const gymId = validarId(req.params.gymId, 'Gym ID');
    const gym = await clienteService.getMyGymDetails(req.admin, gymId);
    res.status(200).json({
      ok: true,
      data: gym
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/client/dashboard/gyms/:gymId/enroll
 */
export async function enrollInGym(req, res, next) {
  try {
    validarUsuario(req);
    const gymId = validarId(req.params.gymId, 'Gym ID');
    const { metodoPago } = req.body;

    const result = await clienteService.enrollInGym(
      req.admin,
      gymId,
      metodoPago
    );

    res.status(201).json({
      ok: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/client/dashboard/my-gyms/:gymId/cancel
 */
export async function cancelGymEnrollment(req, res, next) {
  try {
    validarUsuario(req);
    const gymId = validarId(req.params.gymId, 'Gym ID');

    const result = await clienteService.cancelGymEnrollment(req.admin, gymId);

    res.status(200).json({
      ok: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   CLASS ENROLLMENT
   ============================================================ */

/**
 * GET /api/client/dashboard/my-classes
 */
export async function getMyClasses(req, res, next) {
  try {
    validarUsuario(req);
    const { status } = req.query;
    const classes = await clienteService.getMyClasses(req.admin, status);
    res.status(200).json({
      ok: true,
      data: classes,
      count: classes.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/client/dashboard/my-gyms/:gymId/available-classes
 */
export async function getAvailableClasses(req, res, next) {
  try {
    validarUsuario(req);
    const gymId = validarId(req.params.gymId, 'Gym ID');
    const { includeEnrolled } = req.query;
    const includeEnrolledBool = includeEnrolled === 'true';

    const classes = await clienteService.getAvailableClasses(
      req.admin,
      gymId,
      includeEnrolledBool
    );

    res.status(200).json({
      ok: true,
      data: classes,
      count: classes.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/client/dashboard/classes/:classScheduleId/enroll
 */
export async function enrollInClass(req, res, next) {
  try {
    validarUsuario(req);
    const classScheduleId = validarId(req.params.classScheduleId, 'Class Schedule ID');

    const result = await clienteService.enrollInClass(req.admin, classScheduleId);

    res.status(201).json({
      ok: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/client/dashboard/classes/:classScheduleId/unenroll
 */
export async function unenrollFromClass(req, res, next) {
  try {
    validarUsuario(req);
    const classScheduleId = validarId(req.params.classScheduleId, 'Class Schedule ID');

    const result = await clienteService.unenrollFromClass(req.admin, classScheduleId);

    res.status(200).json({
      ok: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   MACHINES
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms/:gymId/machines
 */
export async function getGymMachines(req, res, next) {
  try {
    validarUsuario(req);
    const gymId = validarId(req.params.gymId, 'Gym ID');

    const machines = await clienteService.getGymMachines(req.admin, gymId);

    res.status(200).json({
      ok: true,
      data: machines,
      count: machines.length
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PRODUCTS
   ============================================================ */

/**
 * GET /api/client/dashboard/my-gyms/:gymId/products
 */
export async function getGymProducts(req, res, next) {
  try {
    validarUsuario(req);
    const gymId = validarId(req.params.gymId, 'Gym ID');
    const { merchandiseOnly } = req.query;
    const merchandiseBool = merchandiseOnly === 'true';

    const products = await clienteService.getGymProducts(req.admin, gymId, merchandiseBool);

    res.status(200).json({
      ok: true,
      data: products,
      count: products.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/client/dashboard/products/:productId/purchase
 */
export async function purchaseProduct(req, res, next) {
  try {
    validarUsuario(req);
    const productId = validarId(req.params.productId, 'Product ID');
    const { cantidad, metodoPago } = req.body;

    const result = await clienteService.purchaseProduct(
      req.admin,
      productId,
      cantidad,
      metodoPago
    );

    res.status(200).json({
      ok: true,
      data: result,
      message: 'To complete the purchase, proceed with payment'
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   USER PROFILE
   ============================================================ */

/**
 * GET /api/client/dashboard/profile
 */
export async function getUserProfile(req, res, next) {
  try {
    validarUsuario(req);
    const profile = await clienteService.getUserProfile(req.admin);

    res.status(200).json({
      ok: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/client/dashboard/profile
 */
export async function updateUserProfile(req, res, next) {
  try {
    validarUsuario(req);
    const updatedProfile = await clienteService.updateUserProfile(req.admin, req.body);

    res.status(200).json({
      ok: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   TRANSACTIONS
   ============================================================ */

/**
 * GET /api/client/dashboard/transactions
 */
export async function getTransactionHistory(req, res, next) {
  try {
    validarUsuario(req);
    const { gymId, limit, offset } = req.query;

    const transactions = await clienteService.getTransactionHistory(
      req.admin,
      gymId,
      limit,
      offset
    );

    res.status(200).json({
      ok: true,
      data: transactions,
      count: transactions.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/client/dashboard/transactions/stats
 */
export async function getTransactionStats(req, res, next) {
  try {
    validarUsuario(req);
    const stats = await clienteService.getTransactionStats(req.admin);

    res.status(200).json({
      ok: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}
