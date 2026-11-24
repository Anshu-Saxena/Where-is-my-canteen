import React, { useCallback, useEffect, useState } from 'react';
import { Clock, ChefHat, PackageCheck, ListOrdered, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { canteenService, queueService } from '../../services/api';
import { QUEUE_LEVEL_STYLES } from '../../utils/queue';
import StatusBadge from '../../components/common/StatusBadge';

const NEXT_STATUS = {
  Pending: 'Accepted',
  Accepted: 'Preparing',
  Preparing: 'Ready for Pickup',
  'Ready for Pickup': 'Completed'
};

const NEXT_LABEL = {
  Pending: 'Accept',
  Accepted: 'Start cooking',
  Preparing: 'Mark ready',
  'Ready for Pickup': 'Mark collected'
};

export default function OwnerLiveQueuePage() {
  const { user } = useAuth();
  const canteenId = user?.canteenId || 'canteen-1';
  const { orders, updateOrderStatus } = useOrders();
  const [canteen, setCanteen] = useState(null);
  const [queue, setQueue] = useState(null);
  const [queueError, setQueueError] = useState('');
  const refreshQueue = useCallback(async () => {
    try {
      const [currentCanteen, currentQueue] = await Promise.all([
        canteenService.getCanteenById(canteenId),
        queueService.getCanteenQueue(canteenId)
      ]);
      if (!currentCanteen) throw new Error('This canteen is no longer available.');
      setCanteen(currentCanteen);
      setQueue(currentQueue);
      setQueueError('');
    } catch (error) {
      setQueueError(error.message);
    }
  }, [canteenId]);

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 15000);
    return () => clearInterval(interval);
  }, [refreshQueue]);

  const styles = queue?.available ? QUEUE_LEVEL_STYLES[queue.level] : null;

  const activeOrders = orders.filter(
    o => o.canteenId === canteenId && ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brandTextPrimary dark:text-cream">Live Queue Management</h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Queue figures are generated from your live orders — update order states below to keep them accurate
        </p>
      </div>

      {queueError && <p className="text-xs text-rose-600">{queueError}</p>}

      {/* Queue summary */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream flex items-center gap-2">
            <Activity className="w-4 h-4 text-forest dark:text-sage" />
            {canteen?.name || user?.canteenName || 'Canteen'}
          </h3>
          {queue?.available ? (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold ${styles.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              {queue.label}
            </span>
          ) : queue ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold bg-cream-200 dark:bg-brandBorder-dark/50 text-brandText-secondary dark:text-brandText-darkSecondary">
              Unavailable
            </span>
          ) : <span className="text-xs text-brandText-secondary">Loading…</span>}
        </div>

        {!queue ? (
          <p className="text-xs text-brandText-secondary">Loading queue data…</p>
        ) : queue.available ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <QueueTile icon={ListOrdered} label="Pending" value={queue.pending} />
              <QueueTile icon={ChefHat} label="Preparing" value={queue.preparing} />
              <QueueTile icon={PackageCheck} label="Ready" value={queue.ready} />
              <div className="p-4 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
                <Clock className="w-4 h-4 text-forest dark:text-sage" />
                <p className={`text-lg font-extrabold mt-1 ${styles.text}`}>
                  {queue.isIdle ? '0 min' : `~${queue.estimatedWaitMinutes} min`}
                </p>
                <p className="text-[11px] text-brandTextSecondary dark:text-brandText-darkSecondary">Estimated wait</p>
              </div>
            </div>
            <p className="text-2xs text-brandTextSecondary dark:text-brandText-darkSecondary">
              Estimate uses {queue.prepMinutes} min average prep time across parallel stations. Students see this as an
              estimate, not a confirmed slot.
            </p>
          </>
        ) : (
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">{queue.reason}</p>
        )}
      </div>

      {/* Active order board */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          Active Orders ({activeOrders.length})
        </h3>

        {activeOrders.length === 0 ? (
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary py-6 text-center">
            No active orders in the kitchen right now.
          </p>
        ) : (
          <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {activeOrders.map(order => (
              <div key={order.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-forest/30 grid place-items-center font-mono font-bold text-forest dark:text-sage shrink-0">
                    {order.tokenNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-brandText-primary dark:text-cream truncate">
                      #{order.id} · {order.customerName}
                    </p>
                    <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                      Slot {order.pickupSlot}
                      {order.pickupShelf ? ` · Shelf ${order.pickupShelf}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={order.status} />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateOrderStatus(order.id, NEXT_STATUS[order.status]);
                        await refreshQueue();
                      } catch (error) {
                        window.alert(error.message);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition flex items-center gap-1.5"
                  >
                    <span>{NEXT_LABEL[order.status]}</span>
                    {order.status === 'Ready for Pickup' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueTile({ icon: Icon, label, value }) {
  return (
    <div className="p-4 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
      <Icon className="w-4 h-4 text-forest dark:text-sage" />
      <p className="text-lg font-extrabold text-brandTextPrimary dark:text-cream mt-1 tabular-nums">{value}</p>
      <p className="text-[11px] text-brandTextSecondary dark:text-brandText-darkSecondary">{label}</p>
    </div>
  );
}
