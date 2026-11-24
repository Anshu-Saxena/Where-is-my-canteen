import { ApiError } from '../errors.js';

export async function initiateOrderRefund(prisma, order, env, gatewayFactory) {
  const payment = await prisma.paymentTransaction.findFirst({
    where: { orderId: order.id, status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' }
  });
  if (!payment) {
    throw new ApiError(409, 'PAYMENT_NOT_REFUNDABLE', 'No successful payment is available to refund.');
  }

  let gatewayRefund = null;
  if (!payment.isTest) {
    const client = gatewayFactory(env);
    try {
      gatewayRefund = await client.payments.refund(payment.gatewayPaymentId, {
        amount: Math.round(Number(payment.amount) * 100),
        notes: { applicationOrderId: order.id }
      });
    } catch (error) {
      console.error('Razorpay refund request failed.', error?.message);
      throw new ApiError(502, 'RAZORPAY_REFUND_FAILED', 'The payment gateway could not start this refund.');
    }
  }

  await prisma.$transaction([
    prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: { status: 'REFUND_INITIATED' }
    }),
    prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: 'REFUND_INITIATED',
        note: payment.isTest ? 'Sandbox refund requested.' : 'Refund requested from Razorpay.',
        payload: gatewayRefund ? { refundId: gatewayRefund.id, status: gatewayRefund.status } : undefined
      }
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'REFUND_INITIATED' }
    })
  ]);
}
