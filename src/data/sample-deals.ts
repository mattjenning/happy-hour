/**
 * SAMPLE DATA. These venues and deals are invented so the screen has
 * something to show. Real Bed-Stuy deals replace this file later.
 */

export type Deal = {
  id: string;
  venue: string;
  offer: string;
  /** Days the deal starts on. 0 = Sunday, 6 = Saturday. */
  days: number[];
  /** 24-hour clock, "HH:MM". */
  start: string;
  /** 24-hour clock, "HH:MM". An end earlier than the start means it runs past midnight. */
  end: string;
  /** Where the deal was found. null for sample data. */
  sourceUrl: string | null;
  /** The date the deal was last checked, "YYYY-MM-DD". */
  lastChecked: string;
};

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

export const sampleDeals: Deal[] = [
  {
    id: 'sample-1',
    venue: 'Sample Tavern',
    offer: '$5 drafts and $7 well drinks',
    days: EVERY_DAY,
    start: '15:00',
    end: '20:00',
    sourceUrl: null,
    lastChecked: '2026-11-15',
  },
  {
    id: 'sample-2',
    venue: 'Sample Wine Bar',
    offer: 'Half-price glasses of wine',
    days: EVERY_DAY,
    start: '16:00',
    end: '18:30',
    sourceUrl: null,
    lastChecked: '2026-11-15',
  },
  {
    id: 'sample-3',
    venue: 'Sample Cantina',
    offer: '$8 margaritas and $3 tacos',
    days: [0, 1, 2, 3, 4],
    start: '17:00',
    end: '19:00',
    sourceUrl: null,
    lastChecked: '2026-11-15',
  },
  {
    id: 'sample-4',
    venue: 'Sample Corner Pub',
    offer: '$4 cans, $1 off everything else',
    days: WEEKDAYS,
    start: '12:00',
    end: '19:00',
    sourceUrl: null,
    lastChecked: '2026-11-15',
  },
  {
    id: 'sample-5',
    venue: 'Sample Late Bar',
    offer: 'Beer and a shot for $9',
    days: EVERY_DAY,
    start: '22:00',
    end: '01:00',
    sourceUrl: null,
    lastChecked: '2026-11-15',
  },
];
