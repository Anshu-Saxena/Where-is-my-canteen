export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getStatusBadgeProps(status) {
  switch (status) {
    case 'Pending':
      return {
        bg: 'bg-softOrange-100 text-brandText-primary dark:bg-softOrange-950/40 dark:text-brandText-darkPrimary border-softOrange-200 dark:border-softOrange-800/60',
        dot: 'bg-primary',
        label: 'Order Placed'
      };
    case 'Accepted':
      return {
        bg: 'bg-primary text-white dark:bg-primary-700 dark:text-white border-primary-600 dark:border-primary-700',
        dot: 'bg-primary-600',
        label: 'Accepted'
      };
    case 'Preparing':
      return {
        bg: 'bg-cream-200 text-brandText-primary dark:bg-brandBorder-dark dark:text-brandText-darkPrimary border-cream-300 dark:border-brandBorder-dark',
        dot: 'bg-brandText-secondary animate-pulse',
        label: 'Preparing'
      };
    case 'Ready for Pickup':
      return {
        bg: 'bg-secondary text-white dark:bg-secondary-700 dark:text-white border-secondary-700 dark:border-secondary-700',
        dot: 'bg-softOrange-200 animate-ping',
        label: 'Ready for Pickup'
      };
    case 'Completed':
      return {
        bg: 'bg-cream-50 text-brandText-primary dark:bg-brandCard-dark dark:text-brandText-darkPrimary border-brandBorder-light dark:border-brandBorder-dark',
        dot: 'bg-brandText-secondary',
        label: 'Completed'
      };
    case 'Cancelled':
      return {
        bg: 'bg-cream-200 text-brandText-secondary dark:bg-brandBorder-dark dark:text-brandText-darkSecondary border-brandBorder-light dark:border-brandBorder-dark',
        dot: 'bg-brandText-secondary',
        label: 'Cancelled'
      };
    default:
      return {
        bg: 'bg-cream-200 text-brandText-primary dark:bg-brandCard-dark dark:text-brandText-darkSecondary border-brandBorder-light dark:border-brandBorder-dark',
        dot: 'bg-brandText-secondary',
        label: status || 'Unknown'
      };
  }
}
