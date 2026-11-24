import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  QrCode,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Share2,
  Check,
  ChefHat,
  ShoppingBag,
  Store,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { usePayments } from '../../contexts/PaymentContext';
import { useExpress } from '../../contexts/ExpressContext';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge';
import EmptyState from '../../components/common/EmptyState';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { getOrderById, updateOrderStatus, cancelOrder } = useOrders();
  const { createPayment, runSandboxPayment, reconcilePaymentResult, markRefund } = usePayments();
  const { getExpressConfig } = useExpress();
  const navigate = useNavigate();
  const location = useLocation();

  const order = getOrderById(id);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [cancelError, setCancelError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(location.state?.paymentError || '');
  const [payRetrying, setPayRetrying] = useState(false);

  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="The order reference could not be found or has expired."
        actionText="View My Orders"
        actionLink="/student/orders"
      />
    );
  }

  const isPending = order.status === 'Pending';
  const isCancelled = order.status === 'Cancelled';
  const isCompleted = order.status === 'Completed';
  const expressConfig = order.orderType === 'express' ? getExpressConfig(order.canteenId) : null;

  // Advance simulation to test live status
  const handleAdvanceStatus = async () => {
    const sequence = ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed'];
    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      try {
        await updateOrderStatus(order.id, sequence[currentIndex + 1]);
      } catch (error) {
        window.alert(error.message);
      }
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelOrder(order.id, cancelReason);
      setCancelModalOpen(false);
      if (['SUCCESS', 'PAID_SANDBOX'].includes(order.paymentStatus)) {
        try {
          await markRefund(order.id);
        } catch (error) {
          setPaymentNotice(error.message);
        }
      }
    } catch (error) {
      setCancelError(error.message);
    }
  };

  // Online payments that never settled can be retried (sandbox/labelled test).
  const canRetryPayment =
    order.paymentStatus !== 'PAY_AT_COUNTER' &&
    ['PAYMENT_PENDING', 'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'PAYMENT_UNAVAILABLE'].includes(
      order.paymentStatus
    );

  const handleRetryPayment = async () => {
    setPayRetrying(true);
    setPaymentNotice('');
    try {
      const config = await paymentService.getConfig();
      if (config.configured) {
        const initialized = await createPayment({ orderId: order.id });
        const result = await paymentService.openCheckout({
          checkout: initialized.checkout,
          order,
          user: null
        });
        if (result) reconcilePaymentResult(result);
        else setPaymentNotice('Payment was not completed. Your order remains pending.');
      } else if (config.sandboxEnabled) {
        await runSandboxPayment({ orderId: order.id, outcome: 'SUCCESS' });
      } else {
        setPaymentNotice('Online payments are not configured. Please contact the canteen.');
      }
    } catch (error) {
      setPaymentNotice(error.message);
    } finally {
      setPayRetrying(false);
    }
  };

  const trackingSteps = [
    { key: 'Pending', step: 1, label: 'Order Placed' },
    { key: 'Accepted', step: 2, label: 'Accepted' },
    { key: 'Preparing', step: 3, label: 'Preparing' },
    { key: 'Ready for Pickup', step: 4, label: 'Ready for Pickup' },
    { key: 'Completed', step: 5, label: 'Completed' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back link */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brandText-secondary hover:text-forest dark:hover:text-cream transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>All Orders</span>
        </Link>

        {/* Live Simulator Button for Demo Testing */}
        {!isCancelled && !isCompleted && (
          <button
            onClick={handleAdvanceStatus}
            className="px-3.5 py-1.5 rounded-2xl bg-sage-100 dark:bg-forest/50 text-forest dark:text-sage-200 border border-sage-300 dark:border-forest text-xs font-bold hover:bg-sage-200 transition shadow-subtle flex items-center gap-1.5"
            title="Advance order status step (Demo kitchen helper)"
          >
            <ChefHat className="w-3.5 h-3.5 stroke-[2]" />
            <span>Simulate Kitchen Next Step</span>
          </button>
        )}
      </div>
      {paymentNotice && (
        <p role="alert" className="px-6 py-3 text-xs text-rose-700 dark:text-rose-300">
          {paymentNotice}
        </p>
      )}

      {/* Main Order Confirmation Card */}
      <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle overflow-hidden">
        {/* Header Banner */}
        <div className="bg-forest p-6 text-cream text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cream-100/15 text-cream text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
              <span>Token Confirmed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Order #{order.id}
            </h1>
            <p className="text-xs text-sage-200 mt-1">
              {order.canteenName} • {order.campusName}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 bg-cream/10 backdrop-blur-md rounded-2xl p-3 sm:px-5 sm:py-3 text-center border border-cream/20">
            <span className="text-[10px] uppercase font-bold text-sage-200 tracking-wider block">
              Collection Token
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cream block mt-0.5">
              {order.tokenNumber}
            </span>
          </div>
        </div>

        {/* Payment status strip */}
        <div className="px-6 py-3.5 border-b border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap items-center justify-between gap-3 bg-cream-50/60 dark:bg-brandBorder-dark/20">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-brandText-secondary dark:text-brandText-darkSecondary">
              {order.paymentMethod}
            </span>
            <PaymentStatusBadge status={order.paymentStatus} isTest={order.paymentIsTest} />
          </div>
          {canRetryPayment && (
            <button
              onClick={handleRetryPayment}
              disabled={payRetrying}
              className="px-3.5 py-1.5 rounded-2xl bg-primary hover:bg-primary-600 text-cream text-xs font-semibold transition-colors shadow-subtle disabled:opacity-60"
            >
              {payRetrying ? 'Processing…' : 'Retry payment (Test)'}
            </button>
          )}
        </div>

        {/* Express counter notice */}
        {expressConfig && (
          <div className="px-6 py-3.5 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-2.5 bg-softOrange-50 dark:bg-softOrange-950/30 text-softOrange-700 dark:text-softOrange-300">
            <Zap className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span className="text-xs font-semibold">
              Express order — collect from {expressConfig.counterName} (ready in ~{expressConfig.prepTimeMinutes} mins).
            </span>
          </div>
        )}

        {/* Live Tracking Progress Bar */}
        <div className="p-6 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-brandText-primary dark:text-cream">
              Live Order Status
            </h3>
            <StatusBadge status={order.status} />
          </div>

          {!isCancelled ? (
            <div className="space-y-4">
              {/* Stepper Dots */}
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-cream-200 dark:bg-brandBorder-dark">
                  <div
                    style={{ width: `${(order.statusStep / 5) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-forest transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-5 text-center gap-1">
                  {trackingSteps.map(st => {
                    const isDone = order.statusStep >= st.step;
                    const isCurrent = order.statusStep === st.step;

                    return (
                      <div key={st.key} className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition ${
                            isDone
                              ? 'bg-primary text-white'
                              : 'bg-cream-200 dark:bg-brandBorder-dark text-brandText-secondary'
                          }`}
                        >
                          {isDone ? '✓' : st.step}
                        </div>
                        <span
                          className={`text-[10px] leading-tight font-medium ${
                            isCurrent
                              ? 'font-bold text-forest dark:text-cream'
                              : isDone
                              ? 'text-brandText-primary dark:text-brandText-darkSecondary font-semibold'
                              : 'text-brandText-secondary dark:text-brandText-darkSecondary'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status explanation */}
              <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-3 text-xs">
                <Clock className="w-4 h-4 text-forest dark:text-sage-300 flex-shrink-0 stroke-[2]" />
                <div>
                  <span className="font-bold text-brandText-primary dark:text-cream">
                    Reserved Slot: {order.pickupSlot}
                  </span>
                  <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-[11px] mt-0.5">
                    {order.status === 'Ready for Pickup'
                      ? '✨ Your order is packed and ready! Present this token at the collection window.'
                      : order.status === 'Preparing'
                      ? 'Kitchen staff is actively preparing and packing your meal.'
                      : order.status === 'Accepted'
                      ? 'Kitchen has accepted your pre-order ticket.'
                      : 'Order received. Kitchen will begin preparation for your slot.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
              <p className="font-bold">This order was cancelled.</p>
              <p className="mt-1">Reason: {order.cancellationReason || 'Cancelled by student'}</p>
            </div>
          )}
        </div>

        {/* Digital QR Code Token Presentation */}
        <div className="p-6 border-b border-brandBorder-light dark:border-brandBorder-dark flex flex-col sm:flex-row items-center justify-between gap-6 bg-cream-50/60 dark:bg-brandBorder-dark/20">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brandText-secondary">
              Flash Counter Token
            </span>
            <h4 className="text-lg font-bold text-brandText-primary dark:text-cream mt-1">
              Token {order.tokenNumber}
            </h4>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary max-w-sm mt-1 leading-relaxed">
              Show this token number or have the canteen staff scan the verification QR code at the counter.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-cream rounded-2xl shadow-subtle border border-brandBorder-light text-center flex-shrink-0">
            {/* Clean QR Graphic */}
            <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <rect width="100" height="100" fill="#ffffff"/>
              <path d="M10 10h30v30h-30zM15 15v20h20v-20zM22 22h6v6h-6z" fill="#33302D"/>
              <path d="M60 10h30v30h-30zM65 15v20h20v-20zM72 22h6v6h-6z" fill="#33302D"/>
              <path d="M10 60h30v30h-30zM15 65v20h20v-20zM22 72h6v6h-6z" fill="#33302D"/>
              <circle cx="50" cy="50" r="8" fill="#D9825B" />
              <rect x="50" y="20" width="8" height="15" fill="#33302D"/>
              <rect x="70" y="60" width="18" height="8" fill="#33302D"/>
              <rect x="60" y="75" width="25" height="15" fill="#33302D"/>
              <rect x="45" y="70" width="8" height="18" fill="#33302D"/>
            </svg>
            <span className="text-[10px] font-mono font-bold text-brandText-primary block mt-1">
              {order.id}
            </span>
          </div>
        </div>

        {/* Ordered Food Items List */}
        <div className="p-6 space-y-4">
          <h4 className="font-bold text-sm text-brandText-primary dark:text-cream">
            Items Ordered
          </h4>

          <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-brandText-primary dark:text-cream">
                    {item.quantity}x {item.name}
                  </span>
                  {item.customization && (
                    <p className="text-brandText-secondary text-[11px] mt-0.5">{item.customization}</p>
                  )}
                </div>
                <span className="font-mono text-brandText-primary dark:text-cream font-bold">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark space-y-1.5 text-xs text-brandText-secondary">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="text-brandText-primary dark:text-cream font-semibold">{formatCurrency(order.itemSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Taxes</span>
              <span className="text-brandText-primary dark:text-cream font-semibold">{formatCurrency(order.taxes)}</span>
            </div>
            <div className="flex justify-between">
              <span>Convenience Fee</span>
              <span className="text-brandText-primary dark:text-cream font-semibold">{formatCurrency(order.convenienceFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-brandText-primary dark:text-cream pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark">
              <span>Total Amount</span>
              <span className="text-forest dark:text-sage-300 font-extrabold">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-cream-100/60 dark:bg-brandBorder-dark/30 border-t border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap items-center justify-between gap-3">
          {isPending ? (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 dark:text-rose-400"
            >
              Cancel Order
            </button>
          ) : (
            <span className="text-xs text-brandText-secondary">
              Free cancellation is locked once kitchen starts preparing.
            </span>
          )}

          <div className="flex items-center gap-2">
            <Link
              to="/student/canteens"
              className="px-4 py-2 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-xs font-semibold text-brandText-primary dark:text-cream hover:bg-cream-100 transition shadow-subtle"
            >
              Order More Items
            </Link>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brandText-primary/50 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-brandCard-dark rounded-3xl max-w-md w-full p-6 shadow-elevated border border-brandBorder-light dark:border-brandBorder-dark animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
            </div>

            <h3 className="text-lg font-bold text-brandText-primary dark:text-cream mb-1">
              Cancel Order #{order.id}?
            </h3>
            <p className="text-xs text-brandText-secondary mb-4 leading-relaxed">
              Since the kitchen has not started cooking your order yet, you can cancel it with an instant refund to your source payment method.
            </p>

            {cancelError && (
              <p className="text-xs text-rose-600 font-semibold mb-3">{cancelError}</p>
            )}

            <div className="space-y-2 mb-5 text-xs">
              <label className="block font-semibold text-brandText-primary dark:text-cream">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs text-brandText-primary dark:text-cream"
              >
                <option value="Change of schedule">Class schedule changed</option>
                <option value="Ordered by mistake">Selected wrong item</option>
                <option value="Need different slot">Need a different pickup time window</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark text-xs font-semibold text-brandText-primary dark:text-cream"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
