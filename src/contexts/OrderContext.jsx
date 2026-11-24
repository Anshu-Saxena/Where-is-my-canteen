import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const ORDER_STATUSES = [
  { step: 1, key: 'Pending', label: 'Order Placed', color: 'bg-softOrange-100 text-brandText-primary' },
  { step: 2, key: 'Accepted', label: 'Accepted by Kitchen', color: 'bg-primary text-white' },
  { step: 3, key: 'Preparing', label: 'Preparing Food', color: 'bg-softOrange-200 text-brandText-primary' },
  { step: 4, key: 'Ready for Pickup', label: 'Ready for Pickup', color: 'bg-secondary text-white' },
  { step: 5, key: 'Completed', label: 'Collected & Completed', color: 'bg-cream-200 text-brandText-primary' }
];

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) {
      setOrders([]);
      setIsLoadingOrders(false);
      return () => {
        active = false;
      };
    }

    setIsLoadingOrders(true);
    setOrdersError('');
    apiRequest('/orders')
      .then(({ orders: loadedOrders }) => {
        if (active) {
          setOrders(loadedOrders);
          setOrdersError('');
        }
      })
      .catch(error => {
        if (active) setOrdersError(error.message);
      })
      .finally(() => {
        if (active) setIsLoadingOrders(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const storeOrder = (order) => {
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
    pickupSlot,
    paymentMethod,
    customer,
    orderType = 'standard'
  }) => {
    const kioskOrder = orderType === 'kiosk';
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
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const response = await apiRequest(`/owner/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    });
    return storeOrder(response.order);
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
    const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      body: { reason }
    });
    storeOrder(response.order);
    return { success: response.success, message: 'Order successfully cancelled' };
  };

  const getOrderById = (id) => orders.find(ord => ord.id === id);

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoadingOrders,
        ordersError,
        storeOrder,
        createOrder,
        updateOrderStatus,
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
