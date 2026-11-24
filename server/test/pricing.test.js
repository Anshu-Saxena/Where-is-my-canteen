import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateOrderAmounts, resolveCustomization } from '../src/orders/pricing.js';

test('checkout customization prices are resolved from stored menu options', () => {
  const resolved = resolveCustomization(
    [{ id: 'size', options: [{ name: 'Large', price: 12.5 }] }],
    'Large'
  );

  assert.deepEqual(resolved, { summary: 'Large', extraCents: 1250 });
});

test('unknown or removed customization choices are rejected', () => {
  assert.throws(
    () => resolveCustomization([{ id: 'size', options: ['Small'] }], 'Large'),
    error => error.code === 'INVALID_CUSTOMIZATION'
  );
});

test('totals use server prices and round GST to the nearest paise', () => {
  assert.deepEqual(calculateOrderAmounts([
    { price: 15, quantity: 2 },
    { price: 1.01, quantity: 1 }
  ]), {
    itemSubtotal: 31.01,
    taxes: 1.55,
    convenienceFee: 5,
    totalAmount: 37.56
  });
});
