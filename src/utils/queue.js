/**
 * Live queue estimation.
 *
 * Estimated wait is derived from ACTUAL active orders and each canteen's
 * advertised preparation time — nothing here is hardcoded. It is only ever an
 * ESTIMATE and is always labelled as such in the UI (never a confirmed pickup
 * slot). If there is not enough live data, `available` is false so the UI can
 * show a proper "unavailable" state.
 */

const ACTIVE_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'];

// Rough parallelism: how many order stations a kitchen can work on at once.
const PARALLEL_STATIONS = 3;

export function parsePrepMinutes(estimatedPrepTime, fallback = 12) {
  if (!estimatedPrepTime || typeof estimatedPrepTime !== 'string') return fallback;
  const numbers = estimatedPrepTime.match(/\d+/g);
  if (!numbers || numbers.length === 0) return fallback;
  const values = numbers.map(Number);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg || fallback;
}

export function computeQueue(orders, canteen) {
  if (!canteen) {
    return {
      available: false,
      reason: 'Canteen information is unavailable right now.'
    };
  }

  const canteenOrders = orders.filter(o => o.canteenId === canteen.id);
  const liveOrders = canteenOrders.filter(o => ACTIVE_STATUSES.includes(o.status));

  // No live orders at all -> we can still report an empty queue (0 wait),
  // but if the canteen is closed we treat live data as unavailable.
  if (!canteen.isOpen) {
    return {
      available: false,
      reason: 'This canteen is currently closed. Live queue data is unavailable.'
    };
  }

  const pending = canteenOrders.filter(o => ['Pending', 'Accepted'].includes(o.status)).length;
  const preparing = canteenOrders.filter(o => o.status === 'Preparing').length;
  const ready = canteenOrders.filter(o => o.status === 'Ready for Pickup').length;

  const prepMinutes = parsePrepMinutes(canteen.estimatedPrepTime);
  const backlog = pending + preparing;
  const estimatedWaitMinutes = Math.round((backlog * prepMinutes) / PARALLEL_STATIONS);

  let level = 'low';
  if (estimatedWaitMinutes > 20) level = 'high';
  else if (estimatedWaitMinutes > 10) level = 'moderate';

  const label =
    level === 'low' ? 'Low waiting time' : level === 'moderate' ? 'Moderate waiting time' : 'High waiting time';

  return {
    available: true,
    pending,
    preparing,
    ready,
    activeCount: liveOrders.length,
    estimatedWaitMinutes,
    level,
    label,
    prepMinutes,
    isIdle: backlog === 0
  };
}

export const QUEUE_LEVEL_STYLES = {
  low: {
    dot: 'bg-sage',
    text: 'text-forest dark:text-sage',
    chip: 'bg-sage/20 text-forest dark:text-sage border border-sage/40',
    bar: 'bg-sage'
  },
  moderate: {
    dot: 'bg-softOrange',
    text: 'text-softOrange-700 dark:text-softOrange-300',
    chip: 'bg-softOrange-100 text-softOrange-700 dark:text-softOrange-300 border border-softOrange-200',
    bar: 'bg-softOrange'
  },
  high: {
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    chip: 'bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200',
    bar: 'bg-rose-500'
  }
};
