/**
 * Real happy hours in Bed-Stuy, Brooklyn.
 *
 * Rules for this file:
 * - Every deal names where it was found (sourceUrl) and when (lastChecked).
 * - When sources disagree, list only the days and hours they all agree on.
 *   Sending someone to a bar with no deal is worse than missing a deal.
 * - A deal whose sources conflict on the basics is left out until confirmed.
 *
 * Status on 2026-11-15: gathered from published guides, not yet confirmed
 * in person. Left out for now because sources conflict or are too thin:
 * Tulum Brooklyn, Doris, The Holler, Chilo's, Lavender Room, The Taco Bar,
 * Paul's.
 */

export type Deal = {
  id: string;
  venue: string;
  address: string;
  offer: string;
  /** Days the deal starts on. 0 = Sunday, 6 = Saturday. */
  days: number[];
  /** 24-hour clock, "HH:MM". */
  start: string;
  /** 24-hour clock, "HH:MM". An end earlier than the start means it runs past midnight. */
  end: string;
  /** Who published the deal. */
  sourceName: string;
  /** The page the deal was found on. */
  sourceUrl: string;
  /** The date the deal was last checked, "YYYY-MM-DD". */
  lastChecked: string;
};

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];

const INFATUATION = {
  sourceName: 'The Infatuation',
  sourceUrl: 'https://www.theinfatuation.com/new-york/guides/the-best-brooklyn-happy-hours',
  lastChecked: '2026-11-15',
};

const HAPPY_HOUR_NYC = {
  sourceName: 'Happy Hour NYC',
  sourceUrl: 'https://happy-hour.nyc/brooklyn/bed-stuy-happy-hour',
  lastChecked: '2026-11-15',
};

export const deals: Deal[] = [
  {
    id: 'bad-luck-bar',
    venue: 'Bad Luck Bar',
    address: '492 Nostrand Ave',
    offer: '$4 beer, $8 wine, $10 cocktails. 13 oysters and 2 drinks for $33.',
    days: EVERY_DAY,
    start: '17:00',
    end: '19:00',
    ...INFATUATION,
  },
  {
    id: 'luckys-monday',
    venue: "Lucky's Cocktail Lounge",
    address: '334 Marcus Garvey Blvd',
    offer: '$5 beer, plus lower prices on wine, cocktails and small plates. All night on Mondays.',
    days: [1],
    start: '16:00',
    end: '00:00',
    ...INFATUATION,
  },
  {
    id: 'luckys',
    venue: "Lucky's Cocktail Lounge",
    address: '334 Marcus Garvey Blvd',
    offer: '$5 beer, plus lower prices on wine, cocktails and small plates.',
    days: [0, 2, 3, 4, 5, 6],
    start: '16:00',
    end: '19:00',
    ...INFATUATION,
  },
  {
    // Sources give a start of opening time, 4:30pm or 5pm. 5pm is the safe one.
    id: 'bar-lunatico',
    venue: 'Bar LunÀtico',
    address: '486 Halsey St',
    offer: '$9 daiquiris, $10 margaritas and Negronis, $2 off wine.',
    days: EVERY_DAY,
    start: '17:00',
    end: '19:00',
    ...INFATUATION,
  },
  {
    id: 'the-swan',
    venue: 'The Swan',
    address: '1048 Bedford Ave',
    offer: '$5 select drafts, $6 house wine.',
    days: WEEKDAYS,
    start: '15:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
  {
    id: 'therapy-wine-bar-weekdays',
    venue: 'Therapy Wine Bar 2.0',
    address: '260 Malcolm X Blvd',
    offer: '$8.25 cocktails, wine and small bites.',
    days: WEEKDAYS,
    start: '16:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
  {
    id: 'therapy-wine-bar-weekend',
    venue: 'Therapy Wine Bar 2.0',
    address: '260 Malcolm X Blvd',
    offer: '$8.25 cocktails, wine and small bites.',
    days: WEEKEND,
    start: '12:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
  {
    // Guides say Monday to Friday. The bar's own site is unclear about Mondays,
    // so Monday is left out until someone confirms it.
    id: 'selune',
    venue: 'Selune',
    address: '478 Halsey St',
    offer: '$1 oysters and $9 wine. Bar seats only.',
    days: [2, 3, 4, 5],
    start: '17:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
];
