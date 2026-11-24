import Razorpay from 'razorpay';
import { ApiError } from '../errors.js';

export function isRazorpayConfigured(env) {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function createRazorpayClient(env) {
  if (!isRazorpayConfigured(env)) {
    throw new ApiError(
      503,
      'PAYMENT_GATEWAY_NOT_CONFIGURED',
      'Razorpay credentials are not configured on the server.'
    );
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });
}
