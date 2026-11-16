import type { Deal, DealKind } from '../data/deals';
import { milesBetween, type Point } from './distance.ts';

const MINUTES_IN_DAY = 24 * 60;

/** "17:30" -> 1050 */
export function toMinutes(clock: string): number {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesIntoDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** A deal whose end is earlier than its start runs past midnight. */
function runsPastMidnight(deal: Deal): boolean {
  return toMinutes(deal.end) <= toMinutes(deal.start);
}

/**
 * Minutes until the deal ends, or null when the deal is not running now.
 */
export function minutesLeft(deal: Deal, now: Date): number | null {
  const current = minutesIntoDay(now);
  const start = toMinutes(deal.start);
  const end = toMinutes(deal.end);
  const today = now.getDay();
  const yesterday = (today + 6) % 7;

  if (!runsPastMidnight(deal)) {
    const running = deal.days.includes(today) && current >= start && current < end;
    return running ? end - current : null;
  }

  // Started today and runs into tomorrow.
  if (deal.days.includes(today) && current >= start) {
    return MINUTES_IN_DAY - current + end;
  }
  // Started yesterday and is still running after midnight.
  if (deal.days.includes(yesterday) && current < end) {
    return end - current;
  }
  return null;
}

export type DealOnNow = {
  deal: Deal;
  minutesLeft: number;
  /** Straight-line distance from the phone, or null when the location is unknown. */
  miles: number | null;
};

/**
 * Deals running right now.
 *
 * With a location: nearest first, and soonest-ending first among deals at the
 * same distance. Without one: soonest-ending first.
 */
export function dealsOnNow(deals: Deal[], now: Date, here: Point | null = null): DealOnNow[] {
  const running: DealOnNow[] = [];
  for (const deal of deals) {
    const left = minutesLeft(deal, now);
    if (left === null) continue;
    running.push({ deal, minutesLeft: left, miles: here ? milesBetween(here, deal) : null });
  }
  return running.sort((a, b) => {
    if (a.miles !== null && b.miles !== null && a.miles !== b.miles) return a.miles - b.miles;
    return a.minutesLeft - b.minutesLeft;
  });
}

/** What the list is narrowed to. */
export type DealFilter = 'all' | 'drinks' | 'food';

/** A deal on both drinks and food shows under either filter. */
export function matchesFilter(kind: DealKind, filter: DealFilter): boolean {
  return filter === 'all' || kind === 'both' || kind === filter;
}

/** The label shown on a card. */
export function kindLabel(kind: DealKind): string {
  if (kind === 'both') return 'Drinks and food';
  return kind === 'food' ? 'Food' : 'Drinks';
}

/** The next deal that starts later today, or null. */
export function nextStartToday(deals: Deal[], now: Date): Deal | null {
  const current = minutesIntoDay(now);
  const today = now.getDay();
  const upcoming = deals
    .filter((deal) => deal.days.includes(today) && toMinutes(deal.start) > current)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  return upcoming[0] ?? null;
}

/** "19:00" -> "7:00 PM" */
export function formatClock(clock: string): string {
  const total = toMinutes(clock);
  const hours24 = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** 70 -> "1 h 10 min" */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-15" becomes "Nov 15". */
export function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}
