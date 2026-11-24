import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  ArrowRight,
  Package,
  Activity,
  ClipboardList,
  Monitor,
  Zap,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { ownerService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const canteenId = user?.canteenId || 'canteen-1';
  const [analytics, setAnalytics] = useState({ todayStats: { totalRevenue: 0, revenueGrowth: '0%', totalOrders: 0 }, popularItems: [] });
  const [analyticsError, setAnalyticsError] = useState('');

  useEffect(() => {
    let active = true;
    ownerService.getAnalytics(canteenId)
      .then(result => {
        if (active) setAnalytics(result);
      })
      .catch(error => {
        if (active) setAnalyticsError(error.message);
      });
    return () => {
      active = false;
    };
  }, [canteenId]);

  const canteenOrders = orders.filter(o => o.canteenId === canteenId);
  const pendingCount = canteenOrders.filter(o => o.status === 'Pending').length;
  const preparingCount = canteenOrders.filter(o => o.status === 'Preparing').length;
  const readyCount = canteenOrders.filter(o => o.status === 'Ready for Pickup').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-brandCard-dark p-6 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👨‍🍳</span>
            <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
              {user?.canteenName || 'Nescafe & Central Cafeteria'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary">
            Canteen Operations & Kitchen Management Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/orders"
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-2 shadow-subtle"
          >
            <span>Kitchen Order Board</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {analyticsError && <p className="text-xs text-rose-600">{analyticsError}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Online Paid Revenue</span>
            <span className="text-xs font-semibold text-forest bg-sage/20 px-2 py-0.5 rounded-full">
              {analytics.todayStats.revenueGrowth}
            </span>
          </div>
          <p className="text-2xl font-bold text-brandText-primary dark:text-cream">
            {formatCurrency(analytics.todayStats.totalRevenue)}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            {analytics.todayStats.totalOrders} orders today
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Pending Kitchen</span>
            <span className="w-2.5 h-2.5 rounded-full bg-softOrange animate-ping" />
          </div>
          <p className="text-2xl font-bold text-softOrange">
            {pendingCount}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Requires kitchen accept</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Actively Cooking</span>
            <ChefHat className="w-4 h-4 text-forest" />
          </div>
          <p className="text-2xl font-bold text-forest dark:text-sage">
            {preparingCount}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">On hot plates / grill</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Ready for Counter</span>
            <CheckCircle2 className="w-4 h-4 text-forest" />
          </div>
          <p className="text-2xl font-bold text-forest dark:text-sage">
            {readyCount}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Awaiting student token</p>
        </div>
      </div>

      {/* Management quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/owner/slots', icon: Clock, label: 'Pickup Slots', hint: 'Capacity per window' },
          { to: '/owner/shelves', icon: Package, label: 'Pickup Shelves', hint: 'Assign & collect' },
          { to: '/owner/queue', icon: Activity, label: 'Live Queue', hint: 'Waiting time' },
          { to: '/owner/orders', icon: ClipboardList, label: 'Order Collection', hint: 'Kitchen board' },
          { to: '/owner/combos', icon: Sparkles, label: 'Combo Meals', hint: 'Value bundles' },
          { to: '/owner/express', icon: Zap, label: 'Express Counter', hint: 'Fast-track items' },
          { to: '/owner/payments', icon: CreditCard, label: 'Payment Status', hint: 'Transactions' },
          { to: '/kiosk', icon: Monitor, label: 'Kiosk Mode', hint: 'Tablet ordering' }
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white dark:bg-brandCard-dark p-4 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex items-center gap-3 hover:border-primary-200 transition"
            >
              <span className="w-9 h-9 rounded-xl bg-softOrange-100 dark:bg-brandBorder-dark text-primary grid place-items-center shrink-0">
                <Icon className="w-4 h-4 stroke-[1.9]" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-brandText-primary dark:text-cream truncate">{item.label}</span>
                <span className="block text-2xs text-brandTextSecondary dark:text-brandText-darkSecondary truncate">{item.hint}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Split: Live Orders Table & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Orders (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
            <div>
              <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
                Recent Counter Orders
              </h3>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
                Incoming pre-orders for current slot window
              </p>
            </div>
            <Link
              to="/owner/orders"
              className="text-xs font-semibold text-forest dark:text-sage hover:underline"
            >
              Manage All Orders →
            </Link>
          </div>

          <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {canteenOrders.slice(0, 4).map(ord => (
              <div key={ord.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-forest/30 flex items-center justify-center font-mono font-bold text-forest dark:text-sage text-sm">
                    {ord.tokenNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brandText-primary dark:text-cream">#{ord.id}</span>
                      <span className="text-brandText-secondary dark:text-brandText-darkSecondary">•</span>
                      <span className="text-brandText-primary dark:text-cream font-medium">{ord.customerName}</span>
                    </div>
                    <p className="text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                      {ord.items.length} items • Slot: <strong className="text-brandText-primary dark:text-cream">{ord.pickupSlot}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={ord.status} />
                  <span className="font-bold text-brandText-primary dark:text-cream">
                    {formatCurrency(ord.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Food Items (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-4">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
            Top Selling Dishes Today
          </h3>

          <div className="space-y-2.5">
            {analytics.popularItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs">
                <div>
                  <p className="font-semibold text-brandText-primary dark:text-cream">
                    {i + 1}. {item.name}
                  </p>
                  <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-[11px] mt-0.5">{item.count} orders today</p>
                </div>
                <span className="font-bold text-forest dark:text-sage">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/owner/menu"
              className="w-full py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark hover:bg-cream-100 dark:hover:bg-brandBorder-dark/40 text-xs font-semibold text-brandText-primary dark:text-cream block text-center transition"
            >
              Update Food Menu & Prices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
