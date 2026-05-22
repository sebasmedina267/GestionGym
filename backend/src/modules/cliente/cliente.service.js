/**
 * Client Dashboard Service
 * 
 * Business logic layer for client-specific operations.
 * Coordinates between controller and repository layers.
 */

import * as clienteRepository from './cliente.repository.js';
import { AppError } from '../../utils/AppError.js';

/* ============================================================
   GYM AFFILIATION
   ============================================================ */

/**
 * Get all gyms where user is enrolled
 */
export async function getMyGyms(admin) {
  if (admin.gymId) {
    const gym = await clienteRepository.getNativeClientGymDetails(admin.id, admin.gymId);
    return gym ? [gym] : [];
  }
  const gyms = await clienteRepository.getUserGyms(admin.id);
  return gyms;
}

/**
 * Get detailed info about a specific enrolled gym
 */
export async function getMyGymDetails(admin, gymId) {
  const gymId_num = Number(gymId);
  if (isNaN(gymId_num)) throw new AppError('Invalid gym ID', 400);

  if (admin.gymId) {
    if (admin.gymId !== gymId_num) throw new AppError('You are not enrolled in this gym', 403);
    const gym = await clienteRepository.getNativeClientGymDetails(admin.id, admin.gymId);
    if (!gym) throw new AppError('You are not enrolled in this gym', 403);
    return gym;
  }

  const gym = await clienteRepository.getUserGymDetails(admin.id, gymId_num);
  if (!gym) {
    throw new AppError('You are not enrolled in this gym', 403);
  }

  return gym;
}

/**
 * Enroll user in a gym
 * 
 * For STRIPE payment: Payment intent is created separately via Stripe module
 * For EFECTIVO: Enrollment is created with PENDIENTE_PAGO status
 */
export async function enrollInGym(admin, gymId, metodoPago = 'STRIPE') {
  if (admin.gymId) throw new AppError('Native clients cannot enroll in other gyms', 400);
  const userId = admin.id;
  const gymId_num = Number(gymId);
  if (isNaN(gymId_num)) throw new AppError('Invalid gym ID', 400);

  // Check if already enrolled
  const isEnrolled = await clienteRepository.isUserEnrolledInGym(userId, gymId_num);
  if (isEnrolled) {
    throw new AppError('You are already enrolled in this gym', 400);
  }

  // Enroll in gym
  const result = await clienteRepository.enrollUserInGym(userId, gymId_num, metodoPago);

  return {
    success: true,
    message: 'Successfully enrolled in gym',
    metodoPago,
    status: metodoPago === 'STRIPE' ? 'ACTIVO' : 'PENDIENTE_PAGO'
  };
}

/**
 * Cancel gym enrollment
 */
export async function cancelGymEnrollment(admin, gymId) {
  if (admin.gymId) throw new AppError('Native clients cannot cancel enrollment via app', 400);
  const userId = admin.id;
  const gymId_num = Number(gymId);
  if (isNaN(gymId_num)) throw new AppError('Invalid gym ID', 400);

  // Check if enrolled
  const isEnrolled = await clienteRepository.isUserEnrolledInGym(userId, gymId_num);
  if (!isEnrolled) {
    throw new AppError('You are not enrolled in this gym', 404);
  }

  // Cancel enrollment
  await clienteRepository.updateGymEnrollmentStatus(userId, gymId_num, 'CANCELADO');

  return {
    success: true,
    message: 'Gym enrollment cancelled'
  };
}

/* ============================================================
   CLASS ENROLLMENT
   ============================================================ */

/**
 * Get classes user is enrolled in
 */
export async function getMyClasses(admin, status = 'upcoming') {
  const validStatuses = ['upcoming', 'past', 'all'];
  const statusParam = validStatuses.includes(status) ? status : 'upcoming';

  if (admin.gymId) {
    return await clienteRepository.getNativeClientClasses(admin.id, statusParam);
  }

  const classes = await clienteRepository.getUserClasses(admin.id, statusParam);
  return classes;
}

/**
 * Get available classes for a gym
 */
export async function getAvailableClasses(admin, gymId, includeEnrolled = false) {
  const gymId_num = Number(gymId);
  if (isNaN(gymId_num)) throw new AppError('Invalid gym ID', 400);

  // Verify user is enrolled in this gym
  const isEnrolled = admin.gymId 
    ? admin.gymId === gymId_num 
    : await clienteRepository.isUserEnrolledInGym(admin.id, gymId_num);

  if (!isEnrolled) {
    throw new AppError('You are not enrolled in this gym', 403);
  }

  const classes = await clienteRepository.getAvailableClassesForGym(
    admin.id,
    gymId_num,
    includeEnrolled
  );
  return classes;
}

/**
 * Enroll user in a specific class
 */
export async function enrollInClass(admin, classScheduleId) {
  const classScheduleId_num = Number(classScheduleId);
  if (isNaN(classScheduleId_num)) throw new AppError('Invalid class schedule ID', 400);

  // Check if already enrolled
  const isEnrolled = admin.gymId 
    ? await clienteRepository.isNativeClientEnrolledInClass(admin.id, classScheduleId_num)
    : await clienteRepository.isUserEnrolledInClass(admin.id, classScheduleId_num);
    
  if (isEnrolled) {
    throw new AppError('You are already enrolled in this class', 400);
  }

  // Enroll in class
  const result = admin.gymId
    ? await clienteRepository.enrollNativeClientInClass(admin.id, classScheduleId_num)
    : await clienteRepository.enrollUserInClass(admin.id, classScheduleId_num);

  return {
    success: true,
    message: 'Successfully enrolled in class'
  };
}

/**
 * Unenroll user from a class
 */
export async function unenrollFromClass(admin, classScheduleId) {
  const classScheduleId_num = Number(classScheduleId);
  if (isNaN(classScheduleId_num)) throw new AppError('Invalid class schedule ID', 400);

  // Unenroll from class
  const result = admin.gymId
    ? await clienteRepository.unenrollNativeClientFromClass(admin.id, classScheduleId_num)
    : await clienteRepository.unenrollUserFromClass(admin.id, classScheduleId_num);

  if (result.affectedRows === 0) {
    throw new AppError('Class enrollment not found', 404);
  }

  return {
    success: true,
    message: 'Successfully unenrolled from class'
  };
}

/* ============================================================
   MACHINES
   ============================================================ */

/**
 * Get machines at a gym
 */
export async function getGymMachines(admin, gymId) {
  const gymId_num = Number(gymId);
  if (isNaN(gymId_num)) throw new AppError('Invalid gym ID', 400);

  // Verify user is enrolled in this gym
  const isEnrolled = admin.gymId 
    ? admin.gymId === gymId_num 
    : await clienteRepository.isUserEnrolledInGym(admin.id, gymId_num);
    
  if (!isEnrolled) {
    throw new AppError('You are not enrolled in this gym', 403);
  }

  const machines = await clienteRepository.getGymMachines(gymId_num);
  return machines;
}

/* ============================================================
   PRODUCTS
   ============================================================ */

/**
 * Get products from a gym
 */
export async function getGymProducts(admin, gymId, merchandiseOnly = false) {
  const gymId_num = Number(gymId);
  if (isNaN(gymId_num)) throw new AppError('Invalid gym ID', 400);

  // Verify user is enrolled in this gym
  const isEnrolled = admin.gymId 
    ? admin.gymId === gymId_num 
    : await clienteRepository.isUserEnrolledInGym(admin.id, gymId_num);
    
  if (!isEnrolled) {
    throw new AppError('You are not enrolled in this gym', 403);
  }

  const products = await clienteRepository.getGymProducts(gymId_num, merchandiseOnly);
  return products;
}

/**
 * Purchase product (initiate payment flow)
 * 
 * Returns necessary data to initiate Stripe payment
 */
export async function purchaseProduct(admin, productId, cantidad = 1, metodoPago = 'STRIPE') {
  const productId_num = Number(productId);
  if (isNaN(productId_num)) throw new AppError('Invalid product ID', 400);
  if (cantidad < 1) throw new AppError('Quantity must be at least 1', 400);

  // For now, return data for Stripe payment initiation
  // Actual payment processing should be done via Stripe module
  return {
    productId: productId_num,
    cantidad,
    metodoPago,
    requiresPayment: metodoPago === 'STRIPE'
  };
}

/* ============================================================
   USER PROFILE
   ============================================================ */

/**
 * Get user profile
 */
export async function getUserProfile(admin) {
  if (admin.gymId) {
    const profile = await clienteRepository.getNativeClientProfile(admin.id);
    if (!profile) throw new AppError('User not found', 404);
    return profile;
  }
  const profile = await clienteRepository.getUserProfile(admin.id);
  if (!profile) {
    throw new AppError('User not found', 404);
  }

  // Update last activity
  await clienteRepository.updateLastActivity(admin.id);

  return profile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(admin, data) {
  if (admin.gymId) {
    await clienteRepository.updateNativeClientProfile(admin.id, data);
    return await clienteRepository.getNativeClientProfile(admin.id);
  }
  const updatedUser = await clienteRepository.updateUserProfile(admin.id, data);

  return await clienteRepository.getUserProfile(admin.id);
}

/* ============================================================
   TRANSACTIONS
   ============================================================ */

/**
 * Get user transaction history
 */
export async function getTransactionHistory(admin, gymId = null, limit = 50, offset = 0) {
  const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
  const offsetNum = Math.max(parseInt(offset) || 0, 0);

  if (admin.gymId) {
    return await clienteRepository.getNativeClientTransactions(admin.id, limitNum, offsetNum);
  }

  const transactions = await clienteRepository.getUserTransactions(
    admin.id,
    gymId ? Number(gymId) : null,
    limitNum,
    offsetNum
  );

  return transactions;
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(admin) {
  if (admin.gymId) {
    return await clienteRepository.getNativeClientTransactionStats(admin.id);
  }
  const stats = await clienteRepository.getUserTransactionStats(admin.id);
  return stats;
}
