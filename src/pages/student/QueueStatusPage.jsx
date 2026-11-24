import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChefHat, PackageCheck, ListOrdered, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { useUniversity } from '../../contexts/UniversityContext';
import { useOrders } from '../../contexts/OrderContext';
import { canteenService, queueService } from '../../services/api';
import { QUEUE_LEVEL_STYLES } from '../../utils/queue';
import StatusBadge from '../../components/common/StatusBadge';

export default function QueueStatusPage() {
  const { selectedCampus } = useUniversity();
  const { orders } = useOrders();

  const [canteens, setCanteens] = useState([]);
  const [queueByCanteen, setQueueByCanteen] = useState({});
  const [orderQueueById, setOrderQueueById] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loadError, setLoadError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const hasLoaded = useRef(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!hasLoaded.current) setLoading(true);
      setLoadError('');
      try {
        const data = await canteenService.getCanteens({ campusId: selectedCampus?.id });
        const queues = await Promise.all(data.map(async canteen => [
          canteen.id,
          await queueService.getCanteenQueue(canteen.id)
        ]));
        if (active) {
          setCanteens(data);
          setQueueByCanteen(Object.fromEntries(queues));
          setLastUpdated(new Date());
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      } finally {
        if (active) {
          hasLoaded.current = true;
          setLoading(false);
        }
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedCampus?.id, refreshVersion]);

  useEffect(() => {
    let active = true;
    const activeOrders = orders.filter(order =>
      ['Pending', 'Accepted', 'Preparing'].includes(order.status) &&
      canteens.some(canteen => canteen.id === order.canteenId)
    );
    if (activeOrders.length === 0) {
      setOrderQueueById({});
      return () => {
        active = false;
      };
    }

    Promise.all(activeOrders.map(async order => {
      try {
        return [order.id, await queueService.getOrderQueuePosition(order.id)];
      } catch (error) {
        return [order.id, { error: error.message }];
      }
    })).then(entries => {
      if (active) setOrderQueueById(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [orders, canteens]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">Live Queue Status</h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Estimated waiting time per canteen, calculated from live active orders
          </p>
        </div>
        <button
          onClick={() => setRefreshVersion(previous => previous + 1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-xs font-semibold text-brandText-primary dark:text-cream hover:bg-cream-100 dark:hover:bg-brandBorder-dark/40 transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loadError && <p className="text-xs text-rose-600">{loadError}</p>}

      {/* Estimate disclaimer — clearly distinguishes estimate from confirmed slot */}
      <div className="p-3.5 rounded-2xl bg-softOrange-50 dark:bg-softOrange-950/30 border border-softOrange-200 dark:border-softOrange-900 text-xs text-softOrange-700 dark:text-softOrange-300 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          These are <strong>estimated</strong> waiting times based on the canteen’s current order load and preparation
          speed. They are not your confirmed pickup slot — your exact pickup window is shown on your order.
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card rounded-2xl p-5 space-y-3">
              <div className="h-4 w-2/3 bg-cream-200 dark:bg-brandBorder-dark rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-cream-200 dark:bg-brandBorder-dark rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : canteens.length === 0 ? (
        <div className="card rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-brandText-primary dark:text-cream">No canteens found</p>
          <p className="text-2xs text-brandText-secondary mt-1">Queue data will appear once canteens are listed for this campus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canteens.map(canteen => {
            const queue = queueByCanteen[canteen.id];
            if (!queue) return null;
            const styles = queue.available ? QUEUE_LEVEL_STYLES[queue.level] : null;
            const myOrders = orders.filter(order =>
              order.canteenId === canteen.id &&
              ['Pending', 'Accepted', 'Preparing'].includes(order.status)
            );

            return (
              <div key={canteen.id} className="card rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-brandText-primary dark:text-cream truncate">{canteen.name}</h3>
                    <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5 truncate">
                      {canteen.location}
                    </p>
                  </div>
                  {queue.available ? (
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold ${styles.chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {queue.label}
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold bg-cream-200 dark:bg-brandBorder-dark/50 text-brandText-secondary dark:text-brandText-darkSecondary">
                      <AlertCircle className="w-3 h-3" />
                      Unavailable
                    </span>
                  )}
                </div>

                {queue.available ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <QueueStat icon={ListOrdered} label="Pending" value={queue.pending} />
                      <QueueStat icon={ChefHat} label="Preparing" value={queue.preparing} />
                      <QueueStat icon={PackageCheck} label="Ready" value={queue.ready} />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between">
                      <span className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Estimated wait
                      </span>
                      <span className={`text-sm font-extrabold ${styles.text}`}>
                        {queue.isIdle ? 'No wait' : `~${queue.estimatedWaitMinutes} mins`}
                      </span>
                    </div>

                    <Link
                      to={`/student/canteen/${canteen.id}`}
                      className="block text-center px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition"
                    >
                      Order from {canteen.name.split(' ')[0]}
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {queue.reason}
                  </p>
                )}

                {myOrders.length > 0 && (
                  <div className="space-y-2 border-t border-brandBorder-light dark:border-brandBorder-dark pt-3">
                    <p className="text-xs font-semibold text-brandText-primary dark:text-cream">Your active orders</p>
                    {myOrders.map(order => {
                      const position = orderQueueById[order.id];
                      const positionText = position?.error
                        ? position.error
                        : position?.position
                          ? `Queue position ${position.position}${position.estimatedWaitMinutes === null
                            ? ''
                            : ` · about ${position.estimatedWaitMinutes} min`}`
                          : position?.message || 'Refreshing your queue position…';
                      return (
                        <Link
                          key={order.id}
                          to={`/student/orders/${encodeURIComponent(order.id)}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-cream-50 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark px-3 py-2.5 hover:border-primary-300 transition"
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-brandText-primary dark:text-cream">
                              Token {order.tokenNumber}
                            </span>
                            <span className="block text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                              {positionText}
                            </span>
                          </span>
                          <StatusBadge status={order.status} />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-2xs text-center text-brandText-secondary dark:text-brandText-darkSecondary">
        Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
      </p>
    </div>
  );
}

function QueueStat({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
      <Icon className="w-3.5 h-3.5 mx-auto text-forest dark:text-sage" />
      <p className="text-lg font-extrabold text-brandText-primary dark:text-cream mt-1 tabular-nums">{value}</p>
      <p className="text-[10px] text-brandText-secondary dark:text-brandText-darkSecondary">{label}</p>
    </div>
  );
}
