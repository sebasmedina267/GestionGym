import api from './axios';

/**
 * Crear payment intent para suscripción de Dueño
 */
export const createOwnerSubscriptionPayment = async (data) => {
  const response = await api.post('/stripe/owner-subscription', data);
  return response.data;
};

/**
 * Crear payment intent para nueva sucursal
 */
export const createBranchSubscriptionPayment = async (data) => {
  const response = await api.post('/stripe/branch-subscription', data);
  return response.data;
};

/**
 * Verificar estado del pago
 */
export const verifyPaymentIntent = async (paymentIntentId) => {
  const response = await api.post('/stripe/verify-payment', {
    paymentIntentId,
  });
  return response.data;
};

/**
 * Confirmar registro de Dueño después de pago
 */
export const confirmOwnerPayment = async (data) => {
  const response = await api.post('/auth/confirm-owner-payment', data);
  return response.data;
};

/**
 * Crear sucursal después de pago
 */
export const createBranchAfterPayment = async (data, foto = null) => {
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('direccion', data.direccion || '');
  formData.append('ciudad', data.ciudad || '');
  formData.append('urlWeb', data.urlWeb || '');
  formData.append('paymentIntentId', data.paymentIntentId);
  if (foto) formData.append('foto', foto);

  const response = await api.post('/auth/create-branch-after-payment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
