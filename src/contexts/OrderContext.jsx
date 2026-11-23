import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_ORDERS } from '../data/mockData';

const OrderContext = createContext();

export const ORDER_STATUSES = [
  { step: 1, key: 'Pending', label: 'Order Placed', color: 'bg-softOrange-100 text-brandText-primary' },
  { step: 2, key: 'Accepted', label: 'Accepted by Kitchen', color: 'bg-primary text-white' },
  { step: 3, key: 'Preparing', label: 'Preparing Food', color: 'bg-softOrange-200 text-brandText-primary' },
  { step: 4, key: 'Ready for Pickup', label: 'Ready for Pickup', color: 'bg-secondary text-white' },
  { step: 5, key: 'Completed', label: 'Collected & Completed', color: 'bg-cream-200 text-brandText-primary' }
];

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('wmc_orders');
    return saved ? JSON.parse(saved) : SAMPLE_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('wmc_orders', JSON.stringify(orders));
  }, [orders]);

  const createOrder = ({
    items,
    canteen,
    university,
    campus,
    pickupSlot,
    paymentMethod,
    subtotal,
    taxes,
    convenienceFee,
    grandTotal,
    customer
  }) => {
    const randomIdNumber = Math.floor(1000 + Math.random() * 9000);
    const randomTokenNumber = Math.floor(10 + Math.random() * 89);
    const orderId = `WMC-${randomIdNumber}`;
    const tokenNumber = `T-${randomTokenNumber}`;

    const newOrder = {
      id: orderId,
      tokenNumber,
      canteenId: canteen.id,
      canteenName: canteen.name,
      universityName: university.name,
      campusName: campus.name,
      createdAt: new Date().toISOString(),
      pickupSlot: pickupSlot.time,
      status: 'Pending',
      statusStep: 1,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
        customization: item.customization
      })),
      itemSubtotal: subtotal,
      taxes,
      convenienceFee,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'Pay at Counter' ? 'PAY_AT_COUNTER' : 'PAID_ONLINE',
      customerName: customer?.name || 'Campus Student',
      customerRoll: customer?.rollNumber || '2023/CS/104',
      customerPhone: customer?.phone || '+91 98765 43210'
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const statusMap = {
      'Pending': 1,
      'Accepted': 2,
      'Preparing': 3,
      'Ready for Pickup': 4,
      'Completed': 5,
      'Cancelled': 1
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: newStatus,
            statusStep: statusMap[newStatus] || ord.statusStep
          };
        }
        return ord;
      })
    );
  };

  const cancelOrder = (orderId, reason = 'Cancelled by student') => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return { success: false, message: 'Order not found' };
    if (target.status !== 'Pending') {
      return {
        success: false,
        message: 'Order cannot be cancelled as kitchen has already started preparation.'
      };
    }

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'Cancelled',
            cancellationReason: reason,
            paymentStatus: ord.paymentMethod === 'Pay at Counter' ? 'CANCELLED_UNPAID' : 'REFUND_INITIATED'
          };
        }
        return ord;
      })
    );
    return { success: true, message: 'Order successfully cancelled' };
  };

  const getOrderById = (id) => orders.find(ord => ord.id === id);

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        getOrderById,
        activeOrders: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)),
        completedOrders: orders.filter(o => o.status === 'Completed'),
        cancelledOrders: orders.filter(o => o.status === 'Cancelled')
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}
