import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  CheckCircle2,
  Bell,
  QrCode,
  Clock,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { usePickup } from '../../contexts/PickupContext';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export default function PickupStatusPage() {
  const { orders } = useOrders();
  const { getShelfConfig, loadShelfConfig } = usePickup();

  const scoped = orders;
  const canteenIds = [...new Set(scoped.map(order => order.canteenId))].join('|');
  const [pickupLoadError, setPickupLoadError] = useState('');

  useEffect(() => {
    if (!canteenIds) return;
    Promise.allSettled(canteenIds.split('|').map(loadShelfConfig)).then(results => {
      const failure = results.find(result => result.status === 'rejected');
      setPickupLoadError(failure?.reason.message || '');
    });
  }, [canteenIds, loadShelfConfig]);

  const readyOrders = scoped.filter(o => o.status === 'Ready for Pickup');
  const inProgress = scoped.filter(o => ['Pending', 'Accepted', 'Preparing'].includes(o.status));
  const collected = scoped.filter(o => o.status === 'Completed').slice(0, 6);

  const renderShelf = (order) => {
    const config = getShelfConfig(order.canteenId);
    if (!config.enabled) {
      return (
        <span className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary">
          Collect at counter
        </span>
      );
    }
    return (
      <span className="font-mono font-extrabold text-forest dark:text-sage text-lg">
        {order.pickupShelf || '—'}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">Pickup Status</h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Collect your food from the shelf shown below — no need to join the ordering queue
          </p>
        </div>
        <Link
          to="/student/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brandText-secondary hover:text-forest dark:hover:text-cream transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>All Orders</span>
        </Link>
      </div>

      {pickupLoadError && <p className="text-xs text-rose-600">{pickupLoadError}</p>}

      {/* Ready for pickup */}
      {readyOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-forest dark:text-sage">
            <Bell className="w-4 h-4" />
            <h2 className="font-display text-base font-bold">Ready for pickup</h2>
          </div>

          {readyOrders.map(order => {
            const config = getShelfConfig(order.canteenId);
            return (
              <div
                key={order.id}
                className="card rounded-3xl overflow-hidden border-sage/50 dark:border-forest/60"
              >
                <div className="bg-forest p-5 text-cream flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cream-100/15 text-cream text-xs font-semibold mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Your food is ready</span>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight">Order #{order.id}</h3>
                    <p className="text-xs text-sage-200 mt-1">
                      {order.canteenName} • {order.campusName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-cream/10 rounded-2xl px-4 py-2 text-center border border-cream/20">
                      <span className="text-[10px] uppercase font-bold text-sage-200 tracking-wider block">Token</span>
                      <span className="text-xl font-extrabold font-mono text-cream block">{order.tokenNumber}</span>
                    </div>
                    {config.enabled && (
                      <div className="bg-cream/10 rounded-2xl px-4 py-2 text-center border border-cream/20">
                        <span className="text-[10px] uppercase font-bold text-sage-200 tracking-wider block">Shelf</span>
                        <span className="text-xl font-extrabold font-mono text-cream block">{order.pickupShelf || '—'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={order.status} />
                    <span className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
                      Ready {order.readyAt ? formatDateTime(order.readyAt) : 'just now'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-forest dark:text-sage shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-brandText-primary dark:text-cream flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Collection point
                      </p>
                      <p className="text-brandText-secondary dark:text-brandText-darkSecondary mt-1 leading-relaxed">
                        {config.enabled
                          ? config.instructions
                          : 'This canteen does not use pickup shelves. Collect your order at the counter window using your token number.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-2xs text-brandText-secondary flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" />
                      Show token or QR at the counter if asked
                    </span>
                    <Link
                      to={`/student/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition"
                    >
                      View order
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brandText-primary dark:text-cream">
            <Clock className="w-4 h-4 text-softOrange" />
            <h2 className="font-display text-base font-bold">Being prepared</h2>
          </div>
          <div className="card rounded-2xl divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {inProgress.map(order => (
              <Link
                key={order.id}
                to={`/student/orders/${order.id}`}
                className="p-4 flex items-center justify-between gap-3 hover:bg-cream-100/60 dark:hover:bg-brandBorder-dark/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-softOrange-100 text-primary grid place-items-center font-mono font-bold text-xs shrink-0">
                    {order.tokenNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brandText-primary dark:text-cream truncate">
                      #{order.id} · {order.canteenName}
                    </p>
                    <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                      Slot {order.pickupSlot} — a shelf will be assigned once ready
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Collected records */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-bold text-brandText-primary dark:text-cream">
          Collected orders
        </h2>
        {collected.length === 0 ? (
          <EmptyState
            title="No collected orders yet"
            description="Orders you collect will be listed here as a record."
            actionText="Explore canteens"
            actionLink="/student/canteens"
          />
        ) : (
          <div className="card rounded-2xl divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {collected.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sage/20 text-forest dark:text-sage grid place-items-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brandText-primary dark:text-cream truncate">
                      #{order.id} · {order.canteenName}
                    </p>
                    <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                      Token {order.tokenNumber}
                      {order.pickupShelf ? ` · Shelf ${order.pickupShelf}` : ''} ·{' '}
                      {order.collectedAt ? formatDateTime(order.collectedAt) : 'Collected'}
                    </p>
                  </div>
                </div>
                <span className="text-2xs font-semibold text-forest dark:text-sage shrink-0">Collected</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
