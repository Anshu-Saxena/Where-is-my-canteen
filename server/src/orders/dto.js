import { statusToUi } from './pricing.js';

const STATUS_STEP = {
  PENDING: 1,
  ACCEPTED: 2,
  PREPARING: 3,
  READY_FOR_PICKUP: 4,
  COMPLETED: 5,
  CANCELLED: 1
};

export function toOrderDto(order) {
  const latestPayment = order.payments?.[0];
  return {
    id: order.displayId,
    tokenNumber: order.tokenNumber,
    canteenId: order.canteenId,
    canteenName: order.canteen.name,
    universityName: order.university?.name ?? '',
    campusName: order.campus?.name ?? '',
    createdAt: order.createdAt.toISOString(),
    pickupSlot: order.pickupSlotLabel ?? 'At counter',
    pickupSlotId: order.pickupSlotId,
    pickupShelf: order.pickupShelf?.label ?? null,
    status: statusToUi(order.status),
    statusStep: STATUS_STEP[order.status] ?? 1,
    orderType: order.orderType,
    items: order.items.map(item => ({
      id: item.menuItemId ?? item.comboMealId,
      name: item.name,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      customization: item.customization
    })),
    itemSubtotal: Number(order.itemSubtotal),
    taxes: Number(order.taxes),
    convenienceFee: Number(order.convenienceFee),
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentIsTest: order.paymentIsTest,
    paymentGatewayPaymentId: latestPayment?.gatewayPaymentId ?? null,
    customerName: order.customerName,
    customerRoll: order.customerRoll,
    customerPhone: order.customerPhone,
    cancellationReason: order.cancellationReason,
    readyAt: order.readyAt?.toISOString() ?? null,
    collectedAt: order.collectedAt?.toISOString() ?? null
  };
}

export const orderInclude = {
  canteen: { include: { campus: { include: { university: true } } } },
  university: true,
  campus: true,
  pickupShelf: true,
  items: true,
  payments: { orderBy: { createdAt: 'desc' }, take: 1 }
};
