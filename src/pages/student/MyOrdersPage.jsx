import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ReceiptText } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import OrderCard from '../../components/order/OrderCard';
import EmptyState from '../../components/common/EmptyState';

export default function MyOrdersPage() {
  const { activeOrders, completedOrders, cancelledOrders, cancelOrder, isLoadingOrders, ordersError } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') === 'history' ? 'history' : 'active');
  const [cancelError, setCancelError] = useState('');

  const tabs = [
    { key: 'active', label: 'Active', icon: Clock, count: activeOrders.length },
    { key: 'history', label: 'Order History', icon: ReceiptText, count: completedOrders.length + cancelledOrders.length },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, count: completedOrders.length },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, count: cancelledOrders.length }
  ];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'history') setActiveTab('history');
    else if (['active', 'completed', 'cancelled'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const getDisplayedOrders = () => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'completed') return completedOrders;
    if (activeTab === 'cancelled') return cancelledOrders;
    return [...completedOrders, ...cancelledOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const currentList = getDisplayedOrders();

  const handleCancel = async (orderId) => {
    setCancelError('');
    try {
      await cancelOrder(orderId, 'Cancelled by student from orders tab');
    } catch (error) {
      setCancelError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Track live pickup tokens, receipts and past campus orders
        </p>
      </div>
      {cancelError && (
        <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{cancelError}</p>
      )}
      {ordersError && (
        <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{ordersError}</p>
      )}
      {isLoadingOrders && (
        <p className="text-xs text-brandText-secondary">Loading your orders...</p>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none border-b border-brandBorder-light dark:border-brandBorder-dark">
        {tabs.map(({ key, label, icon: Icon, count }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setSearchParams(key === 'active' ? {} : { tab: key });
              }}
              className={`py-3 px-3.5 -mb-px border-b-2 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                active
                  ? 'border-forest text-forest dark:border-sage-300 dark:text-sage-300'
                  : 'border-transparent text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary dark:hover:text-cream'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-2xs font-bold tabular-nums ${
                    active
                      ? 'bg-sage-100 dark:bg-forest/60 text-forest dark:text-cream'
                      : 'bg-cream-200 dark:bg-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={
            activeTab === 'active'
              ? 'No active orders in progress'
              : activeTab === 'completed'
              ? 'No completed orders yet'
              : activeTab === 'cancelled'
              ? 'No cancelled orders'
              : 'No order history yet'
          }
          description={
            activeTab === 'active'
              ? 'You have no pending food pre-orders. Explore campus canteens to place a new order!'
              : 'Your meal history will appear here once you collect your canteen tokens.'
          }
          actionText={activeTab === 'active' ? 'Browse Canteens' : null}
          actionLink="/student/canteens"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onCancelClick={(id) => handleCancel(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
