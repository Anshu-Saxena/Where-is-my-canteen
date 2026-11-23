import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';

export default function OrderCard({ order, onCancelClick }) {
  const isPending = order.status === 'Pending';

  return (
    <div className="card p-4 sm:p-5 transition-all duration-200 hover:shadow-card-hover">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-brandText-primary dark:text-cream">
            #{order.id}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-cream-100 dark:bg-brandBorder-dark text-forest dark:text-sage-300 font-mono font-bold text-2xs border border-brandBorder-light dark:border-brandBorder-dark">
            {order.tokenNumber}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="py-3">
        <h4 className="font-display font-bold text-[15px] text-brandText-primary dark:text-brandText-darkPrimary mb-1">
          {order.canteenName}
        </h4>
        <div className="flex items-center gap-2 text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
          <span>{order.campusName}</span>
          <span className="text-brandBorder-light dark:text-brandBorder-dark">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-forest dark:text-sage-300">
            <Clock className="w-3 h-3 stroke-[2]" />
            Pickup: {order.pickupSlot}
          </span>
        </div>

        <div className="mt-3 rounded-xl bg-cream-50 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark p-3 space-y-1.5 text-2xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3">
              <span className="text-brandText-primary dark:text-brandText-darkPrimary line-clamp-1">
                <span className="font-bold text-forest dark:text-sage-300">{item.quantity}×</span> {item.name}
              </span>
              <span className="font-mono text-brandText-secondary dark:text-brandText-darkSecondary whitespace-nowrap">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between gap-3">
        <div>
          <span className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary block">Total amount</span>
          <span className="text-[15px] font-bold text-brandText-primary dark:text-brandText-darkPrimary">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPending && onCancelClick && (
            <button
              onClick={() => onCancelClick(order.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              Cancel
            </button>
          )}
          <Link
            to={`/student/orders/${order.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-subtle"
          >
            Live status
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
