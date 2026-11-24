import React, { useEffect, useState } from 'react';
import { BarChart3, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ownerService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export default function OwnerAnalyticsPage() {
  const { user } = useAuth();
  const canteenId = user?.canteenId || 'canteen-1';
  const [analytics, setAnalytics] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    ownerService.getAnalytics(canteenId)
      .then(result => {
        if (active) setAnalytics(result);
      })
      .catch(error => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [canteenId]);

  if (loadError) return <p className="text-sm text-rose-600">{loadError}</p>;
  if (!analytics) return <p className="text-sm text-brandText-secondary">Loading sales analytics…</p>;

  const { todayStats, peakHours, popularItems } = analytics;
  const maxPeakCount = Math.max(1, ...peakHours.map(slot => slot.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
          Canteen Sales & Order Analytics
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Monitor revenue volume, rush hour peaks, and top moving campus items
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider">Online Paid Sales (Today)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-brandText-primary dark:text-cream">
              {formatCurrency(todayStats.totalRevenue)}
            </span>
            <span className="text-xs font-semibold text-forest dark:text-sage flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {todayStats.revenueGrowth}
            </span>
          </div>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Compared with yesterday's paid online sales</p>
        </div>

        <div className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider">Orders Today</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-brandText-primary dark:text-cream">
              {todayStats.totalOrders}
            </span>
          </div>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Non-cancelled orders recorded today</p>
        </div>

        <div className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider">Average Ticket Size</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-forest dark:text-sage">
              {formatCurrency(todayStats.averageTicketSize)}
            </span>
            <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">/ order</span>
          </div>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Average {todayStats.averageItemsPerPaidOrder.toFixed(1)} items per paid online order
          </p>
        </div>
      </div>

      {/* Hourly Rush Distribution Bar Chart */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <div>
            <h3 className="font-bold text-base text-brandText-primary dark:text-cream flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-forest dark:text-sage" />
              <span>Hourly Order Volume & Peak Rush Hours</span>
            </h3>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
              Orders are grouped by their local India-time placement hour
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-softOrange/20 text-softOrange">
            Peak: {todayStats.peakOrderCount} orders/hr
          </span>
        </div>

        {/* Clean CSS Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56">
            {peakHours.map((slot, i) => {
              const heightPercent = Math.round((slot.count / maxPeakCount) * 100);
              const isPeak = slot.count > 0 && slot.count === maxPeakCount;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-brandText-primary dark:text-cream group-hover:scale-110 transition-transform">
                    {slot.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-cream-100 dark:bg-brandBg-dark rounded-xl overflow-hidden h-full flex flex-col justify-end border border-brandBorder-light dark:border-brandBorder-dark">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isPeak
                          ? 'bg-forest'
                          : 'bg-sage'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-brandText-secondary dark:text-brandText-darkSecondary font-medium whitespace-nowrap -rotate-45 sm:rotate-0 mt-1">
                    {slot.time.split(' - ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Performance Table */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-base text-brandText-primary dark:text-cream">
          Item Popularity & Gross Sales
        </h3>

        <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
          {popularItems.map((item, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-brandText-primary dark:text-cream text-sm">
                  {item.name}
                </p>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-xs mt-0.5">{item.count} items ordered</p>
              </div>

              <div className="text-right">
                <span className="font-bold text-brandText-primary dark:text-cream text-sm block">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
