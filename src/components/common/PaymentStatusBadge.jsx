import React from 'react';
import { BadgeCheck, Clock, XCircle, Ban, RotateCcw, Store, AlertTriangle } from 'lucide-react';

/**
 * Payment status badge. Understands both transaction statuses
 * (CREATED/PENDING/SUCCESS/FAILED/CANCELLED/REFUND_*) and the order-side
 * payment statuses used across the app. `isTest` shows an explicit TEST chip so
 * sandbox outcomes are never mistaken for real payments.
 */
export function getPaymentBadgeProps(status) {
  switch (status) {
    case 'SUCCESS':
    case 'PAID_ONLINE':
      return { icon: BadgeCheck, label: 'Paid', cls: 'bg-sage/20 text-forest dark:text-sage border-sage/40' };
    case 'PAID_SANDBOX':
      return { icon: BadgeCheck, label: 'Paid', cls: 'bg-sage/20 text-forest dark:text-sage border-sage/40' };
    case 'PAY_AT_COUNTER':
      return { icon: Store, label: 'Pay at counter', cls: 'bg-softOrange-100 text-softOrange-700 dark:text-softOrange-300 border-softOrange-200' };
    case 'CREATED':
    case 'PENDING':
    case 'PAYMENT_PENDING':
      return { icon: Clock, label: 'Payment pending', cls: 'bg-softOrange-100 text-softOrange-700 dark:text-softOrange-300 border-softOrange-200' };
    case 'FAILED':
    case 'PAYMENT_FAILED':
      return { icon: XCircle, label: 'Payment failed', cls: 'bg-rose-100 text-rose-700 dark:text-rose-300 border-rose-200' };
    case 'CANCELLED':
    case 'PAYMENT_CANCELLED':
      return { icon: Ban, label: 'Payment cancelled', cls: 'bg-cream-200 text-brandText-secondary dark:bg-brandBorder-dark/50 border-brandBorder-light dark:border-brandBorder-dark' };
    case 'PAYMENT_UNAVAILABLE':
      return { icon: AlertTriangle, label: 'Online payment unavailable', cls: 'bg-cream-200 text-brandText-secondary dark:bg-brandBorder-dark/50 border-brandBorder-light dark:border-brandBorder-dark' };
    case 'REFUND_INITIATED':
      return { icon: RotateCcw, label: 'Refund initiated', cls: 'bg-softOrange-100 text-softOrange-700 dark:text-softOrange-300 border-softOrange-200' };
    case 'REFUNDED':
      return { icon: RotateCcw, label: 'Refunded', cls: 'bg-sage/20 text-forest dark:text-sage border-sage/40' };
    default:
      return { icon: Clock, label: status || 'Unknown', cls: 'bg-cream-200 text-brandText-secondary dark:bg-brandBorder-dark/50 border-brandBorder-light dark:border-brandBorder-dark' };
  }
}

export default function PaymentStatusBadge({ status, isTest = false, className = '' }) {
  const { icon: Icon, label, cls } = getPaymentBadgeProps(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold border whitespace-nowrap ${cls} ${className}`}>
      <Icon className="w-3 h-3 shrink-0 stroke-[2]" />
      <span>{label}</span>
      {isTest && status !== 'PAY_AT_COUNTER' && (
        <span className="ml-0.5 px-1 py-0 rounded bg-black/10 dark:bg-white/15 text-[9px] font-bold tracking-wide">
          TEST
        </span>
      )}
    </span>
  );
}
