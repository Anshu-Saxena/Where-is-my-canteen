import { apiRequest } from './apiClient';

const GATEWAY = 'razorpay';

export const PAYMENT_STATUS = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUND_INITIATED: 'REFUND_INITIATED',
  REFUNDED: 'REFUNDED',
  PAY_AT_COUNTER: 'PAY_AT_COUNTER'
};

/** Order-side payment status derived from a gateway transaction status. */
export function mapGatewayStatusToOrderStatus(status, isTest = false) {
  switch (status) {
    case PAYMENT_STATUS.SUCCESS:
      return isTest ? 'PAID_SANDBOX' : 'PAID_ONLINE';
    case PAYMENT_STATUS.PENDING:
    case PAYMENT_STATUS.CREATED:
      return 'PAYMENT_PENDING';
    case PAYMENT_STATUS.FAILED:
      return 'PAYMENT_FAILED';
    case PAYMENT_STATUS.CANCELLED:
      return 'PAYMENT_CANCELLED';
    case PAYMENT_STATUS.REFUND_INITIATED:
      return 'REFUND_INITIATED';
    case PAYMENT_STATUS.REFUNDED:
      return 'REFUNDED';
    case PAYMENT_STATUS.PAY_AT_COUNTER:
      return 'PAY_AT_COUNTER';
    default:
      return 'PAYMENT_UNAVAILABLE';
  }
}

function kioskPath(isKiosk, path) {
  return isKiosk ? `/kiosk${path}` : path;
}

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let checkoutLoadPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutLoadPromise) return checkoutLoadPromise;

  checkoutLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => {
      checkoutLoadPromise = null;
      reject(new Error('Razorpay Checkout could not be loaded.'));
    };
    document.head.appendChild(script);
  });
  return checkoutLoadPromise;
}

export const paymentService = {
  gatewayName: GATEWAY,

  async getConfig() {
    return apiRequest('/payments/config');
  },

  async createPayment({ orderId, isKiosk = false, idempotencyKey = createIdempotencyKey() }) {
    return apiRequest(
      kioskPath(isKiosk, `/orders/${encodeURIComponent(orderId)}/payments`),
      { method: 'POST', body: { idempotencyKey } }
    );
  },

  async runSandboxPayment({ orderId, outcome = 'SUCCESS', isKiosk = false }) {
    const result = await apiRequest(
      kioskPath(isKiosk, `/orders/${encodeURIComponent(orderId)}/payments/sandbox`),
      { method: 'POST', body: { outcome } }
    );
    return {
      test: result.payment.isTest,
      status: result.payment.status,
      gatewayPaymentId: result.payment.gatewayPaymentId,
      payment: result.payment,
      order: result.order
    };
  },

  async verifyPaymentSignature({ orderId, paymentId, signature, isKiosk = false }) {
    const result = await apiRequest(kioskPath(isKiosk, '/payments/verify'), {
      method: 'POST',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      }
    });
    return result;
  },

  async openCheckout({ checkout, order, user, isKiosk = false }) {
    if (!checkout?.keyId || !checkout.gatewayOrderId) {
      throw new Error('Razorpay is not configured for this payment.');
    }
    await loadRazorpayCheckout();
    if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable in this browser.');

    return new Promise((resolve, reject) => {
      let completed = false;
      const instance = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.gatewayOrderId,
        prefill: {
          name: user?.name || order.customerName,
          email: user?.email,
          contact: user?.phone || order.customerPhone
        },
        handler: async result => {
          try {
            const verified = await this.verifyPaymentSignature({
              orderId: result.razorpay_order_id,
              paymentId: result.razorpay_payment_id,
              signature: result.razorpay_signature,
              isKiosk
            });
            completed = true;
            resolve(verified);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss() {
            if (!completed) resolve(null);
          }
        }
      });

      instance.on('payment.failed', event => {
        const message = event?.error?.description || 'Razorpay could not complete the payment.';
        reject(new Error(message));
      });
      instance.open();
    });
  },

  async requestRefund({ orderId }) {
    return apiRequest(`/orders/${encodeURIComponent(orderId)}/refund`, {
      method: 'POST',
      body: {}
    });
  }
};

export default paymentService;
