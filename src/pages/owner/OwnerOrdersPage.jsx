import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Check,
  X,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge';

export default function OwnerOrdersPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, rejectOrder } = useOrders();

  const [filterStatus, setFilterStatus] = useState('All');
  const [tokenSearch, setTokenSearch] = useState('');
  const [verifiedTokenNotice, setVerifiedTokenNotice] = useState(null);
  const [actionError, setActionError] = useState('');

  const canteenOrders = orders.filter(o => o.canteenId === user?.canteenId);

  const filteredOrders = canteenOrders.filter(o => {
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (tokenSearch.trim()) {
      const q = tokenSearch.toLowerCase();
      const matchToken = o.tokenNumber.toLowerCase().includes(q);
      const matchId = o.id.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      if (!matchToken && !matchId && !matchCust) return false;
    }
    return true;
  });

  const handleVerifyTokenInput = (e) => {
    e.preventDefault();
    if (!tokenSearch.trim()) return;

    const match = canteenOrders.find(
      o => o.tokenNumber.toLowerCase() === tokenSearch.trim().toLowerCase() ||
           o.id.toLowerCase() === tokenSearch.trim().toLowerCase()
    );

    if (match) {
      setVerifiedTokenNotice({
        success: true,
        order: match,
        message: `Token verified! ${match.customerName} - ${match.tokenNumber}`
      });
    } else {
      setVerifiedTokenNotice({
        success: false,
        message: `No active order found for token "${tokenSearch}". Please verify the customer screen.`
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setActionError('');
      if (verifiedTokenNotice?.order?.id === orderId) {
        setVerifiedTokenNotice(prev => ({ ...prev, order: updated }));
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleReject = async orderId => {
    try {
      const updated = await rejectOrder(orderId);
      setActionError('');
      if (verifiedTokenNotice?.order?.id === orderId) {
        setVerifiedTokenNotice(prev => ({ ...prev, order: updated }));
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
          Kitchen Live Orders Board
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Accept orders, advance preparation states, and verify counter pickup tokens
        </p>
      </div>

      {actionError && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {actionError}
        </p>
      )}

      {/* Token Quick Scanner & Verification Bar */}
      <div className="bg-primary text-white p-5 rounded-2xl shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-softOrange" />
              <h3 className="font-bold text-sm sm:text-base text-cream">
                Verify Counter Pickup Token
              </h3>
            </div>
            <p className="text-xs text-cream/75 mt-0.5">
              Type the token number from student screen (e.g. T-48 or WMC-8942)
            </p>
          </div>

          <form onSubmit={handleVerifyTokenInput} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. T-48"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-cream/20 bg-black/20 text-cream font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sage w-36 uppercase placeholder:text-cream/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-softOrange text-white font-semibold text-xs hover:bg-softOrange/90 transition"
            >
              Verify Token
            </button>
          </form>
        </div>

        {verifiedTokenNotice && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 ${
              verifiedTokenNotice.success
                ? 'bg-sage/20 border border-sage/40 text-cream'
                : 'bg-red-900/40 border border-red-500/50 text-cream'
            }`}
          >
            <div className="flex items-center gap-2">
              {verifiedTokenNotice.success ? (
                <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
              )}
              <span>{verifiedTokenNotice.message}</span>
            </div>

            {verifiedTokenNotice.success && verifiedTokenNotice.order.status === 'Ready for Pickup' && (
              <button
                onClick={() => handleStatusChange(verifiedTokenNotice.order.id, 'Completed')}
                className="px-3 py-1.5 rounded-lg bg-sage hover:bg-sage/90 text-forest font-bold text-[11px] transition"
              >
                Mark as Handed Over ✓
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-brandBorder-light dark:border-brandBorder-dark text-xs font-semibold">
        {['All', 'Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === st
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-brandCard-dark text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark hover:text-brandText-primary dark:hover:text-cream'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-forest/10 dark:bg-forest/30 flex items-center justify-center font-mono font-bold text-forest dark:text-sage text-base">
                  {order.tokenNumber}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brandText-primary dark:text-cream">
                    #{order.id}
                  </h4>
                  <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
                    {order.customerName} ({order.customerRoll || 'Student'})
                  </p>
                </div>
              </div>

              <StatusBadge status={order.status} />
            </div>

            {/* Timing & Payment */}
            <div className="p-3 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-forest dark:text-sage font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Slot: {order.pickupSlot}</span>
                </div>
                <span className="font-semibold text-brandText-primary dark:text-cream">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-brandText-secondary dark:text-brandText-darkSecondary">
                  {order.paymentMethod}
                </span>
                <PaymentStatusBadge status={order.paymentStatus} isTest={order.paymentIsTest} />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-1.5 text-xs">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-brandText-secondary dark:text-brandText-darkSecondary">
                  <span>
                    <strong className="text-brandText-primary dark:text-cream">{item.quantity}x</strong> {item.name}
                  </span>
                  <span className="font-mono text-brandText-primary dark:text-cream">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Kitchen Action Buttons */}
            <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary">
                Action:
              </span>

              <div className="flex items-center gap-2">
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'Accepted')}
                      className="px-3 py-1.5 rounded-lg bg-forest hover:bg-forest/90 text-white text-xs font-semibold"
                    >
                      Accept Order
                    </button>
                  </>
                )}

                {order.status === 'Accepted' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'Preparing')}
                    className="px-3 py-1.5 rounded-lg bg-forest hover:bg-forest/90 text-white text-xs font-semibold"
                  >
                    Start Cooking 🍳
                  </button>
                )}

                {order.status === 'Preparing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'Ready for Pickup')}
                    className="px-3 py-1.5 rounded-lg bg-softOrange hover:bg-softOrange/90 text-white text-xs font-semibold"
                  >
                    Mark Ready for Counter 🔔
                  </button>
                )}

                {order.status === 'Ready for Pickup' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'Completed')}
                    className="px-3 py-1.5 rounded-lg bg-sage hover:bg-sage/90 text-forest font-bold text-xs"
                  >
                    Hand Over & Complete ✓
                  </button>
                )}

                {order.status === 'Completed' && (
                  <span className="text-xs text-forest dark:text-sage font-bold">
                    Completed & Collected
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark p-8 text-center">
          <p className="text-sm font-semibold text-brandText-primary dark:text-cream">No matching orders</p>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Orders for this canteen will appear here when they are ready for staff review.
          </p>
        </div>
      )}
    </div>
  );
}
