import React, { useState } from 'react';
import { CreditCard, Wallet, Clock, XCircle } from 'lucide-react';
import { usePayments } from '../../contexts/PaymentContext';
import { PAYMENT_STATUS } from '../../services/paymentService';
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const FILTERS = [
  { key: 'All', label: 'All' },
  { key: PAYMENT_STATUS.SUCCESS, label: 'Success' },
  { key: PAYMENT_STATUS.PENDING, label: 'Pending' },
  { key: PAYMENT_STATUS.FAILED, label: 'Failed' },
  { key: PAYMENT_STATUS.CANCELLED, label: 'Cancelled' },
  { key: PAYMENT_STATUS.PAY_AT_COUNTER, label: 'Pay at counter' }
];

/**
 * Owner "Payment Status" section.
 * Read-only view over the payment_transactions store so owners can reconcile
 * gateway payments against orders. Every row is tied to a campus canteen
 * (multi-tenant) and sandbox rows carry a TEST marker.
 */
export default function OwnerPaymentsPage() {
  const { transactions, isLoadingPayments, paymentsError } = usePayments();
  const [filter, setFilter] = useState('All');

  // Reused transactions are scoped to the owner's canteen in a real deployment.
  const list = filter === 'All' ? transactions : transactions.filter(t => t.status === filter);
  const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const settled = transactions.filter(t => t.status === PAYMENT_STATUS.SUCCESS);
  const collected = settled.reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingCount = transactions.filter(t => t.status === PAYMENT_STATUS.PENDING).length;
  const failedCount = transactions.filter(
    t => t.status === PAYMENT_STATUS.FAILED || t.status === PAYMENT_STATUS.CANCELLED
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-forest dark:text-sage-300 stroke-[2]" />
          Payment Status
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Payment records reconciled with orders. Sandbox rows are clearly marked TEST.
        </p>
      </div>
      {paymentsError && (
        <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{paymentsError}</p>
      )}
      {isLoadingPayments && (
        <p className="text-xs text-brandText-secondary">Loading payment records...</p>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-4 flex items-center gap-3 shadow-subtle">
          <Wallet className="w-5 h-5 text-forest dark:text-sage-300 stroke-[2]" />
          <div>
            <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Collected</p>
            <p className="text-sm font-bold text-brandText-primary dark:text-cream">{formatCurrency(collected)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-4 flex items-center gap-3 shadow-subtle">
          <Clock className="w-5 h-5 text-softOrange-500 stroke-[2]" />
          <div>
            <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Pending</p>
            <p className="text-sm font-bold text-brandText-primary dark:text-cream">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-4 flex items-center gap-3 shadow-subtle">
          <XCircle className="w-5 h-5 text-rose-500 stroke-[2]" />
          <div>
            <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Failed / cancelled</p>
            <p className="text-sm font-bold text-brandText-primary dark:text-cream">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
              filter === f.key
                ? 'bg-primary text-white shadow-subtle'
                : 'bg-white dark:bg-brandCard-dark text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No payment records"
          description="Payment transactions will appear here as students check out."
        />
      ) : (
        <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark overflow-hidden shadow-subtle">
          <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {sorted.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-brandText-primary dark:text-cream">
                    {t.orderId} • {t.method}
                  </p>
                  <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                    {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-brandText-primary dark:text-cream">
                    {formatCurrency(t.amount)}
                  </span>
                  <PaymentStatusBadge status={t.status} isTest={t.isTest} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
