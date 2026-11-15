/**
 * A quick check of the "what is on right now" logic.
 * Run with: node scripts/check-deals.mts
 */
import assert from 'node:assert/strict';

import type { Deal } from '../src/data/sample-deals.ts';
import { dealsOnNow, formatClock, formatMinutes, minutesLeft, nextStartToday } from '../src/lib/deals.ts';

const base = { offer: 'x', sourceUrl: null, lastChecked: '2026-11-15' };
const evening: Deal = { ...base, id: 'a', venue: 'A', days: [0], start: '17:00', end: '19:00' };
const long: Deal = { ...base, id: 'b', venue: 'B', days: [0], start: '15:00', end: '20:00' };
const late: Deal = { ...base, id: 'c', venue: 'C', days: [0], start: '22:00', end: '01:00' };

// Sunday, Nov 15 2026 at the given local time.
const at = (h: number, m: number, day = 15) => new Date(2026, 10, day, h, m);

// A normal window.
assert.equal(minutesLeft(evening, at(16, 59)), null, 'not started yet');
assert.equal(minutesLeft(evening, at(17, 0)), 120, 'starts on the minute');
assert.equal(minutesLeft(evening, at(18, 50)), 10);
assert.equal(minutesLeft(evening, at(19, 0)), null, 'over at the end time');

// The wrong day.
assert.equal(minutesLeft(evening, at(18, 0, 16)), null, 'Monday is not listed');

// A window that runs past midnight.
assert.equal(minutesLeft(late, at(21, 59)), null);
assert.equal(minutesLeft(late, at(23, 0)), 120, 'Sunday night');
assert.equal(minutesLeft(late, at(0, 30, 16)), 30, 'early Monday, started Sunday');
assert.equal(minutesLeft(late, at(1, 0, 16)), null);
assert.equal(minutesLeft(late, at(0, 30)), null, 'early Sunday: Saturday is not listed');

// Sorting: soonest-ending first.
const onNow = dealsOnNow([long, late, evening], at(18, 0));
assert.deepEqual(onNow.map((entry) => entry.deal.id), ['a', 'b']);

// The next one to start.
assert.equal(nextStartToday([long, late, evening], at(20, 30))?.id, 'c');
assert.equal(nextStartToday([long, evening], at(20, 30)), null);

// Formatting.
assert.equal(formatClock('19:00'), '7:00 PM');
assert.equal(formatClock('00:30'), '12:30 AM');
assert.equal(formatClock('12:05'), '12:05 PM');
assert.equal(formatMinutes(70), '1 h 10 min');
assert.equal(formatMinutes(45), '45 min');
assert.equal(formatMinutes(120), '2 h');

console.log('All deal checks passed.');
