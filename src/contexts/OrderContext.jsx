import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiRequest } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { SAMPLE_ORDERS } from '../data/mockData';

const OrderContext = createContext();

function isOfflineError(error) {
  return error?.status === 500 ||
    error?.status === 503 ||
    error?.message?.includes('Cannot reach the backend API');
}

function readDemoOrders() {
  try {
    const saved = localStorage.getItem('wmc_demo_orders');
    return saved ? JSON.parse(saved) : SAMPLE_ORDERS;
  } catch {
    return SAMPLE_ORDERS;
  }
}

function writeDemoOrders(orders) {
  try {
    localStorage.setItem('wmc_demo_orders', JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
}

export const ORDER_STATUSES = [
  { step: 1, key: 'Pending', label: 'Order Placed', color: 'bg-softOrange-100 text-brandText-primary' },
  { step: 2, key: 'Accepted', label: 'Accepted by Kitchen', color: 'bg-primary text-white' },
  { step: 3, key: 'Preparing', label: 'Preparing Food', color: 'bg-softOrange-200 text-brandText-primary' },
  { step: 4, key: 'Ready for Pickup', label: 'Ready for Pickup', color: 'bg-secondary text-white' },
  { step: 5, key: 'Completed', label: 'Collected & Completed', color: 'bg-cream-200 text-brandText-primary' }
];

const ORDER_NOTIFICATION_COPY = {
  Accepted: 'Order accepted',
  Preparing: 'Preparation started',
  'Ready for Pickup': 'Ready for pickup',
  Completed: 'Order collected',
  Cancelled: 'Order cancelled'
};

function createOrderNotification(order) {
  const title = ORDER_NOTIFICATION_COPY[order.status];
  if (!title) return null;
  return {
    id: `${order.id}:${order.status}`,
    orderId: order.id,
    title,
    desc: `${order.canteenName} · Token ${order.tokenNumber}`,
    createdAt: new Date().toISOString(),
    unread: true
  };
}

export function OrderProvider({ children }) {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const previousStatuses = useRef(new Map());

  const addOrderNotifications = changedOrders => {
    if (!['student', 'staff', 'guest'].includes(role)) return;
    const additions = changedOrders
      .map(createOrderNotification)
      .filter(Boolean);
    if (additions.length === 0) return;
    setNotifications(previous => {
      const knownIds = new Set(previous.map(notification => notification.id));
      const unseen = additions.filter(notification => !knownIds.has(notification.id));
      return [...unseen, ...previous].slice(0, 30);
    });
  };

  useEffect(() => {
    let active = true;
    if (!user) {
      setOrders([]);
      setNotifications([]);
      previousStatuses.current = new Map();
      setIsLoadingOrders(false);
      return () => {
        active = false;
      };
    }

    setIsLoadingOrders(true);
    setOrdersError('');
    setOrders([]);
    setNotifications([]);
    previousStatuses.current = new Map();

    const loadOrders = async () => {
      try {
        const { orders: loadedOrders } = await apiRequest('/orders');
        if (!active) return;
        const changedOrders = [];
        const currentStatuses = new Map();
        loadedOrders.forEach(order => {
          const previousStatus = previousStatuses.current.get(order.id);
          if (previousStatus && previousStatus !== order.status) changedOrders.push(order);
          currentStatuses.set(order.id, order.status);
        });
        previousStatuses.current = currentStatuses;
        addOrderNotifications(changedOrders);
        setOrders(loadedOrders);
        setOrdersError('');
      } catch (error) {
        if (!active) return;
        if (isOfflineError(error)) {
          const demoOrders = readDemoOrders();
          setOrders(demoOrders);
          setOrdersError('');
        } else {
          setOrdersError(error.message);
        }
      } finally {
        if (active) setIsLoadingOrders(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.id, role]);

  const storeOrder = (order) => {
    const previousStatus = previousStatuses.current.get(order.id);
    if (previousStatus && previousStatus !== order.status) addOrderNotifications([order]);
    previousStatuses.current.set(order.id, order.status);
    setOrders(previous => {
      const exists = previous.some(item => item.id === order.id);
      return exists
        ? previous.map(item => item.id === order.id ? order : item)
        : [order, ...previous];
    });
    return order;
  };

  const createOrder = async ({
    items,
    canteen,
    campus,
    pickupSlot,
    paymentMethod,
    subtotal,
    taxes,
    convenienceFee,
    grandTotal,
    customer,
    orderType = 'standard'
  }) => {
    const kioskOrder = orderType === 'kiosk';
    try {
      const response = await apiRequest(kioskOrder ? '/kiosk/orders' : '/orders', {
        method: 'POST',
        body: {
          canteenId: canteen.id,
          pickupSlotId: pickupSlot?.id ?? null,
          paymentMethod,
          orderType,
          customer: {
            name: customer?.name,
            phone: customer?.phone,
            rollNumber: customer?.rollNumber
          },
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            customization: item.customization
          }))
        }
      });
      return storeOrder(response.order);
    } catch (error) {
      if (!isOfflineError(error)) throw error;
      const now = new Date().toISOString();
      const orderId = `WMC-${Math.floor(100000 + Math.random() * 900000)}`;
      const tokenNumber = `${orderType === 'express' ? 'EXP' : 'T'}-${Math.floor(100 + Math.random() * 899)}`;
      const computedSubtotal = subtotal ?? items.reduce((sum, i) => sum + (i.unitPrice || i.price || 0) * i.quantity, 0);
      const computedTaxes = taxes ?? Number((computedSubtotal * 0.05).toFixed(2));
      const computedFee = convenienceFee ?? 5;
      const computedTotal = grandTotal ?? Number((computedSubtotal + computedTaxes + computedFee).toFixed(2));
      const demoOrder = {
        id: orderId,
        tokenNumber,
        canteenId: canteen.id,
        canteenName: canteen.name,
        campusName: campus?.name || canteen.location || 'Campus',
        status: 'Pending',
        orderType,
        pickupSlot: pickupSlot?.time || 'Next available',
        pickupDate: pickupSlot?.serviceDate || null,
        paymentMethod,
        paymentStatus: paymentMethod === 'Pay at Counter' ? 'PAY_AT_COUNTER' : 'PAID_SANDBOX',
        subtotal: computedSubtotal,
        taxes: computedTaxes,
        convenienceFee: computedFee,
        totalAmount: computedTotal,
        createdAt: now,
        customerName: customer?.name || user?.name || 'Student',
        customerPhone: customer?.phone || user?.phone || '',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice ?? item.price ?? 0,
          customization: item.customization || 'Standard',
          image: item.image,
          isVeg: item.isVeg
        }))
      };
      const updated = [demoOrder, ...readDemoOrders()];
      writeDemoOrders(updated);
      return storeOrder(demoOrder);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await apiRequest(`/owner/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      return storeOrder(response.order);
    } catch (error) {
      if (!isOfflineError(error)) throw error;
      const updated = readDemoOrders().map(ord =>
        ord.id === orderId ? { ...ord, status: newStatus } : ord
      );
      writeDemoOrders(updated);
      const target = updated.find(ord => ord.id === orderId);
      return target ? storeOrder(target) : null;
    }
  };

  const assignShelf = async (orderId, shelf) => {
    const response = await apiRequest(`/owner/orders/${encodeURIComponent(orderId)}/shelf`, {
      method: 'PATCH',
      body: { label: shelf || null }
    });
    return storeOrder(response.order);
  };

  const setOrderPayment = (orderId, patch) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, ...patch } : ord))
    );
  };

  const markCollected = async (orderId) => {
    const response = await apiRequest(`/owner/orders/${encodeURIComponent(orderId)}/collect`, {
      method: 'POST'
    });
    return storeOrder(response.order);
  };

  const cancelOrder = async (orderId, reason = 'Cancelled by student') => {
    try {
      const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
        body: { reason }
      });
      storeOrder(response.order);
      return { success: response.success, message: 'Order successfully cancelled' };
    } catch (error) {
      if (!isOfflineError(error)) throw error;
      const updated = readDemoOrders().map(ord =>
        ord.id === orderId ? { ...ord, status: 'Cancelled', cancelReason: reason } : ord
      );
      writeDemoOrders(updated);
      const target = updated.find(ord => ord.id === orderId);
      if (target) storeOrder(target);
      return { success: true, message: 'Order cancelled in demo mode' };
    }
  };

  const rejectOrder = async (orderId, reason = 'Rejected by canteen') => {
    const response = await apiRequest(`/owner/orders/${encodeURIComponent(orderId)}/reject`, {
      method: 'POST',
      body: { reason }
    });
    return storeOrder(response.order);
  };

  const markNotificationRead = notificationId => {
    setNotifications(previous => previous.map(notification =>
      notification.id === notificationId ? { ...notification, unread: false } : notification
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(previous => previous.map(notification => ({ ...notification, unread: false })));
  };

  const getOrderById = (id) => orders.find(ord => ord.id === id);

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoadingOrders,
        ordersError,
        notifications,
        unreadNotificationsCount: notifications.filter(notification => notification.unread).length,
        markNotificationRead,
        markAllNotificationsRead,
        storeOrder,
        createOrder,
        updateOrderStatus,
        rejectOrder,
        cancelOrder,
        getOrderById,
        assignShelf,
        setOrderPayment,
        markCollected,
        activeOrders: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)),
        completedOrders: orders.filter(o => o.status === 'Completed'),
        cancelledOrders: orders.filter(o => o.status === 'Cancelled'),
        readyOrders: orders.filter(o => o.status === 'Ready for Pickup'),
        uncollectedOrders: orders.filter(o => o.status === 'Ready for Pickup' && !o.collectedAt)
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
