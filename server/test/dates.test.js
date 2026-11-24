import assert from 'node:assert/strict';
import { test } from 'node:test';
import { indiaDateString } from '../../src/utils/dates.js';

test('service dates follow the India calendar after UTC midnight', () => {
  assert.equal(indiaDateString(new Date('2026-11-24T20:00:00.000Z')), '2026-11-25');
});
