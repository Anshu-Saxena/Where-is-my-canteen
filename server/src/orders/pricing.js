import { ApiError } from '../errors.js';

function priceInCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, 'INVALID_PRICE', 'A menu price is invalid.');
  }
  return Math.round(amount * 100);
}

function optionName(option) {
  return typeof option === 'string' ? option : option?.name;
}

export function resolveCustomization(customizations, selectedText = '') {
  const normalized = String(selectedText ?? '').trim();
  if (!normalized || normalized === 'Standard') {
    return { summary: normalized || 'Standard', extraCents: 0 };
  }

  const selectedOptions = normalized.split(',').map(value => value.trim()).filter(Boolean);
  const usedGroups = new Set();
  let extraCents = 0;

  for (const selected of selectedOptions) {
    const match = customizations
      .map((group, index) => ({ group, index }))
      .find(({ group, index }) =>
        !usedGroups.has(index) &&
        Array.isArray(group.options) &&
        group.options.some(option => optionName(option) === selected)
      );

    if (!match) {
      throw new ApiError(400, 'INVALID_CUSTOMIZATION', 'One or more selected item customizations are no longer available.');
    }

    const option = match.group.options.find(value => optionName(value) === selected);
    usedGroups.add(match.index);
    extraCents += priceInCents(typeof option === 'string' ? 0 : option.price ?? 0);
  }

  return { summary: selectedOptions.join(', '), extraCents };
}

export function calculateOrderAmounts(lines) {
  const subtotalCents = lines.reduce(
    (total, line) => total + priceInCents(line.price) * line.quantity,
    0
  );
  const taxesCents = Math.round(subtotalCents * 0.05);
  const convenienceFeeCents = lines.length > 0 ? 500 : 0;

  return {
    itemSubtotal: subtotalCents / 100,
    taxes: taxesCents / 100,
    convenienceFee: convenienceFeeCents / 100,
    totalAmount: (subtotalCents + taxesCents + convenienceFeeCents) / 100
  };
}

export function statusToUi(status) {
  const labels = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    PREPARING: 'Preparing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };
  return labels[status] ?? status;
}

export const NEXT_ORDER_STATUS = Object.freeze({
  PENDING: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  PREPARING: 'READY_FOR_PICKUP',
  READY_FOR_PICKUP: 'COMPLETED'
});
