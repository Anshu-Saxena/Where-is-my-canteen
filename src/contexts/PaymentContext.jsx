import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';
import { apiRequest } from '../services/apiClient';
import { paymentService, mapGatewayStatusToOrderStatus } from '../services/paymentService';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const { user } = useAuth();
  const { storeOrder } = useOrders();
  const [transactions, setTransactions] = useState([]);
  const [paymentsError, setPaymentsError] = useState('');
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  useEffect(() => {
    let active = true;
    if (user?.role !== 'canteen_owner' || !user.canteenId) {
      setTransactions([]);
      setIsLoadingPayments(false);
      return () => {
        active = false;
      };
    }

    setIsLoadingPayments(true);
    apiRequest(`/owner/canteens/${encodeURIComponent(user.canteenId)}/payments`)
      .then(({ transactions: loadedTransactions }) => {
        if (active) {
          setTransactions(loadedTransactions);
          setPaymentsError('');
        }
      })
      .catch(error => {
        if (active) setPaymentsError(error.message);
      })
      .finally(() => {
        if (active) setIsLoadingPayments(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id, user?.canteenId, user?.role]);

  const rememberPayment = payment => {
    if (!payment) return;
    setTransactions(previous => {
      const exists = previous.some(item => item.id === payment.id);
      return exists
        ? previous.map(item => item.id === payment.id ? payment : item)
        : [payment, ...previous];
    });
  };

  const createPayment = async ({ orderId, isKiosk = false }) => {
    const result = await paymentService.createPayment({ orderId, isKiosk });
    rememberPayment(result.payment);
    return result;
  };

  const runSandboxPayment = async options => {
    const result = await paymentService.runSandboxPayment(options);
    rememberPayment(result.payment);
    if (result.order) storeOrder(result.order);
    return result;
  };

  const verifyPayment = async options => {
    const result = await paymentService.verifyPaymentSignature(options);
    rememberPayment(result.payment);
    if (result.order) storeOrder(result.order);
    return result;
  };

  const reconcilePaymentResult = result => {
    rememberPayment(result?.payment);
    if (result?.order) storeOrder(result.order);
  };

  const getByOrder = orderId => transactions.filter(item => item.orderId === orderId);

  const getLatestForOrder = orderId => {
    const list = getByOrder(orderId);
    return list[0] ?? null;
  };

  const markRefund = async orderId => {
    const result = await paymentService.requestRefund({ orderId });
    const payments = await apiRequest(`/orders/${encodeURIComponent(orderId)}/payments`);
    payments.transactions.forEach(rememberPayment);
    const updatedOrder = await apiRequest(`/orders/${encodeURIComponent(orderId)}`);
    storeOrder(updatedOrder.order);
    return result;
  };

  const getOrderPaymentStatus = (orderId, fallback = null) => {
    const payment = getLatestForOrder(orderId);
    return payment ? mapGatewayStatusToOrderStatus(payment.status, payment.isTest) : fallback;
  };

  return (
    <PaymentContext.Provider
      value={{
        transactions,
        paymentsError,
        isLoadingPayments,
        createPayment,
        runSandboxPayment,
        verifyPayment,
        reconcilePaymentResult,
        markRefund,
        getByOrder,
        getLatestForOrder,
        getOrderPaymentStatus
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayments must be used within PaymentProvider');
  return context;
}
