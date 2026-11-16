/**
 * Checks the "what is on right now" logic, then the real deal data.
 * Run with: node scripts/check-deals.mts
 */
import assert from 'node:assert/strict';

import { deals, type Deal } from '../src/data/deals.ts';
import {
  dealsOnNow,
  formatClock,
  formatDate,
  formatMinutes,
  kindLabel,
  matchesFilter,
  minutesLeft,
  nextStartToday,
} from '../src/lib/deals.ts';
import { formatDistance, milesBetween } from '../src/lib/distance.ts';

const base = {
  kind: 'drinks' as const,
  offer: 'x',
  address: 'x',
  lat: 40.68,
  lng: -73.94,
  sourceName: 'x',
  sourceUrl: 'https://example.com',
  lastChecked: '2026-11-15',
};
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

// Sorting with a location: nearest first, whatever the end times.
const near: Deal = { ...long, id: 'near', lat: 40.681, lng: -73.94 };
const far: Deal = { ...evening, id: 'far', lat: 40.7, lng: -73.94 };
const here = { lat: 40.68, lng: -73.94 };
const byDistance = dealsOnNow([far, near], at(18, 0), here);
assert.deepEqual(byDistance.map((entry) => entry.deal.id), ['near', 'far']);
assert.ok(byDistance[0].miles !== null && byDistance[0].miles < 0.1);
assert.equal(dealsOnNow([far, near], at(18, 0))[0].miles, null, 'no location, no distance');
// Same place: soonest-ending first.
assert.deepEqual(dealsOnNow([long, evening], at(18, 0), here).map((entry) => entry.deal.id), ['a', 'b']);

// Distance.
assert.equal(milesBetween(here, here), 0);
const oneDegreeNorth = milesBetween({ lat: 40, lng: -73.94 }, { lat: 41, lng: -73.94 });
assert.ok(Math.abs(oneDegreeNorth - 69.1) < 0.1, `one degree of latitude is about 69.1 miles, got ${oneDegreeNorth}`);
assert.equal(formatDistance(0.02), 'under 0.1 mi');
assert.equal(formatDistance(0.44), '0.4 mi');
assert.equal(formatDistance(12.3), '12 mi');

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

// A window that ends exactly at midnight.
const untilMidnight: Deal = { ...base, id: 'd', venue: 'D', days: [0], start: '16:00', end: '00:00' };
assert.equal(minutesLeft(untilMidnight, at(23, 30)), 30, 'half an hour before midnight');
assert.equal(minutesLeft(untilMidnight, at(0, 0, 16)), null, 'over at midnight');

assert.equal(formatDate('2026-11-15'), 'Nov 15');
assert.equal(formatDate('2026-01-05'), 'Jan 5');

// Filtering by kind.
assert.ok(matchesFilter('food', 'all') && matchesFilter('drinks', 'all') && matchesFilter('both', 'all'));
assert.ok(matchesFilter('food', 'food') && !matchesFilter('drinks', 'food'));
assert.ok(matchesFilter('drinks', 'drinks') && !matchesFilter('food', 'drinks'));
assert.ok(matchesFilter('both', 'food') && matchesFilter('both', 'drinks'), 'both shows under either');
assert.equal(kindLabel('both'), 'Drinks and food');

// The real data: every deal must be complete and well formed.
const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
const ids = new Set<string>();
for (const deal of deals) {
  assert.ok(!ids.has(deal.id), `duplicate id ${deal.id}`);
  ids.add(deal.id);
  assert.ok(['drinks', 'food', 'both'].includes(deal.kind), `${deal.id}: bad kind`);
  assert.ok(deal.venue && deal.address && deal.offer, `${deal.id}: missing text`);
  assert.ok(deal.days.length > 0 && deal.days.every((d) => d >= 0 && d <= 6), `${deal.id}: bad days`);
  assert.match(deal.start, clock, `${deal.id}: bad start`);
  assert.match(deal.end, clock, `${deal.id}: bad end`);
  assert.notEqual(deal.start, deal.end, `${deal.id}: empty window`);
  // Every venue must sit inside a box drawn loosely around Bed-Stuy.
  assert.ok(deal.lat > 40.67 && deal.lat < 40.7, `${deal.id}: latitude is outside Bed-Stuy`);
  assert.ok(deal.lng > -73.96 && deal.lng < -73.91, `${deal.id}: longitude is outside Bed-Stuy`);
  assert.ok(deal.sourceName, `${deal.id}: no source name`);
  assert.match(deal.sourceUrl, /^https:\/\//, `${deal.id}: source must be an https link`);
  assert.match(deal.lastChecked, /^\d{4}-\d{2}-\d{2}$/, `${deal.id}: bad date`);
}
assert.ok(deals.length > 0, 'no deals');

console.log(`All deal checks passed. ${deals.length} real deals.`);
