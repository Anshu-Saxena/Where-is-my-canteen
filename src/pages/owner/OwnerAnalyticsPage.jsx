import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  ArrowUpRight,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { OWNER_ANALYTICS } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

export default function OwnerAnalyticsPage() {
  const { todayStats, peakHours, popularItems } = OWNER_ANALYTICS;

  const maxPeakCount = Math.max(...peakHours.map(p => p.count));

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
          <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider">Gross Sales (Today)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-brandText-primary dark:text-cream">
              {formatCurrency(todayStats.totalRevenue)}
            </span>
            <span className="text-xs font-semibold text-forest dark:text-sage flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {todayStats.revenueGrowth}
            </span>
          </div>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">vs. yesterday's ₹12,540</p>
        </div>

        <div className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider">Total Counter Tokens</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-brandText-primary dark:text-cream">
              {todayStats.totalOrders}
            </span>
            <span className="text-xs font-semibold text-forest dark:text-sage flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {todayStats.ordersGrowth}
            </span>
          </div>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">98.5% on-time pickup rate</p>
        </div>

        <div className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider">Average Ticket Size</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-forest dark:text-sage">
              ₹104.50
            </span>
            <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">/ order</span>
          </div>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Avg 1.8 items per pre-order</p>
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
              Identifies heaviest kitchen congestion times (12:00 PM – 2:00 PM lunch slots)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-softOrange/20 text-softOrange">
            Peak: 48 orders/hr
          </span>
        </div>

        {/* Clean CSS Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56">
            {peakHours.map((slot, i) => {
              const heightPercent = Math.round((slot.count / maxPeakCount) * 100);
              const isPeak = slot.count >= 40;

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
          Item Popularity & Margin Breakdown
        </h3>

        <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
          {popularItems.map((item, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-brandText-primary dark:text-cream text-sm">
                  {item.name}
                </p>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-xs mt-0.5">{item.count} items fulfilled</p>
              </div>

              <div className="text-right">
                <span className="font-bold text-brandText-primary dark:text-cream text-sm block">
                  {formatCurrency(item.revenue)}
                </span>
                <span className="text-[11px] text-forest dark:text-sage font-medium">
                  +15% margin
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
