/**
 * Real timed deals in Bed-Stuy, Brooklyn: drink happy hours and food specials.
 *
 * Rules for this file:
 * - Every deal names where it was found (sourceUrl) and when (lastChecked).
 * - When sources disagree, list only the days and hours they all agree on.
 *   Sending someone to a bar with no deal is worse than missing a deal.
 * - A deal whose sources conflict on the basics is left out until confirmed.
 * - Coordinates come from NYC's public address search
 *   (geosearch.planninglabs.nyc), looked up by street address.
 *
 * Status on 2026-11-15: gathered from published guides and listing sites,
 * not yet confirmed in person. A deal is listed once two independent sources
 * agree on it, or one source gives full details and nothing contradicts it.
 *
 * Left out for now:
 * - Sources conflict: Tulum Brooklyn (1056 Broadway), Cocktail Bedstuy,
 *   BKB Brooklyn Brasserie, All Night Skate.
 * - Days not stated: Skytown (921 Broadway), reported noon to 7pm. Its own
 *   Instagram gives opening hours of noon to 4am daily but no happy hour days.
 * - One thin source: The Holler, Lavender Room, The Taco Bar, Secret Pour,
 *   Hart Bar, The Buren.
 * - May have closed: Chilo's.
 */

/** What the deal is on. 'both' is a drink deal that also has food, like oysters. */
export type DealKind = 'drinks' | 'food' | 'both';

export type Deal = {
  id: string;
  kind: DealKind;
  venue: string;
  address: string;
  /** Where the venue is, in decimal degrees. */
  lat: number;
  lng: number;
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

// Venues. A venue with two windows (weekday and weekend, say) has two deals.
const BAD_LUCK_BAR = {
  venue: 'Bad Luck Bar',
  address: '492 Nostrand Ave',
  lat: 40.68203,
  lng: -73.95009,
};
const LUCKYS = {
  venue: "Lucky's Cocktail Lounge",
  address: '334 Marcus Garvey Blvd',
  lat: 40.68578,
  lng: -73.93884,
};
const BAR_LUNATICO = {
  venue: 'Bar LunÀtico',
  address: '486 Halsey St',
  lat: 40.6834,
  lng: -73.93468,
};
const THE_SWAN = {
  venue: 'The Swan',
  address: '1048 Bedford Ave',
  lat: 40.68908,
  lng: -73.95537,
};
const THERAPY_WINE_BAR = {
  venue: 'Therapy Wine Bar 2.0',
  address: '260 Malcolm X Blvd',
  lat: 40.68427,
  lng: -73.92964,
};
const SELUNE = {
  venue: 'Selune',
  address: '478 Halsey St',
  lat: 40.68335,
  lng: -73.93497,
};
const DORIS = {
  venue: 'Doris',
  address: '1088 Fulton St',
  lat: 40.68131,
  lng: -73.95738,
};
const PAULS = {
  venue: "Paul's",
  address: '283 Nostrand Ave',
  lat: 40.68898,
  lng: -73.95107,
};
const BARBS = {
  venue: "Barb's",
  address: '380A Marcus Garvey Blvd',
  lat: 40.68408,
  lng: -73.93844,
};
const WONDERVILLE = {
  venue: 'Wonderville',
  address: '1186 Broadway',
  lat: 40.6924,
  lng: -73.92761,
};
const THE_BROADWAY = {
  venue: 'The Broadway',
  address: '1272 Broadway',
  lat: 40.6909,
  lng: -73.92495,
};
const SKYTOWN = {
  venue: 'Skytown',
  address: '921 Broadway',
  lat: 40.69767,
  lng: -73.93606,
};

// Sources.
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
const FIVE_PM_NYC = {
  sourceName: '5pm.nyc',
  sourceUrl: 'https://5pm.nyc/bedford-stuyvesant/',
  lastChecked: '2026-11-15',
};
const BK_MAG = {
  sourceName: 'Brooklyn Magazine',
  sourceUrl: 'https://www.bkmag.com/2024/09/06/the-best-happy-hours-in-brooklyn-right-now/',
  lastChecked: '2026-11-15',
};
// The bars' own Instagram posts. These outrank guides and listing sites.
const LUNATICO_INSTAGRAM = {
  sourceName: 'Bar LunÀtico on Instagram',
  sourceUrl: 'https://www.instagram.com/barlunatico/p/DYcudJIFTn-/',
  lastChecked: '2026-11-15',
};
const LUCKYS_INSTAGRAM = {
  sourceName: "Lucky's on Instagram",
  sourceUrl: 'https://www.instagram.com/luckyscocktail/reel/DawdQ23sx3O/',
  lastChecked: '2026-11-15',
};
// The bar's own specials card, in its "ON SPECIAL" highlight. Matthew found
// the bar's April 2024 post announcing the burger deal.
const BROADWAY_INSTAGRAM = {
  sourceName: 'The Broadway on Instagram',
  sourceUrl: 'https://www.instagram.com/stories/highlights/17974970192244233/',
  lastChecked: '2026-11-15',
};
const LUCKYS_WINGS_INSTAGRAM = {
  sourceName: "Lucky's on Instagram",
  sourceUrl: 'https://www.instagram.com/luckyscocktail/reel/DchJ1KDp2Sh/',
  lastChecked: '2026-11-15',
};
const SKYTOWN_INSTAGRAM = {
  sourceName: 'Skytown on Instagram',
  sourceUrl: 'https://www.instagram.com/skytownbk/p/DE-JZeau6_a/',
  lastChecked: '2026-11-15',
};

export const deals: Deal[] = [
  {
    id: 'bad-luck-bar',
    kind: 'both',
    ...BAD_LUCK_BAR,
    offer: '$4 beer, $8 wine, $10 cocktails. 13 oysters and 2 drinks for $33.',
    days: EVERY_DAY,
    start: '17:00',
    end: '19:00',
    ...INFATUATION,
  },
  {
    id: 'luckys-monday',
    kind: 'both',
    ...LUCKYS,
    offer: '$5 beer, plus lower prices on wine, cocktails and small plates. All night on Mondays.',
    days: [1],
    start: '16:00',
    end: '00:00',
    ...LUCKYS_INSTAGRAM,
  },
  {
    id: 'luckys',
    kind: 'both',
    ...LUCKYS,
    offer: '$5 beer, plus lower prices on wine, cocktails and small plates.',
    days: [0, 2, 3, 4, 5, 6],
    start: '16:00',
    end: '19:00',
    ...INFATUATION,
  },
  {
    // Prices are from the bar's own pinned post. Guides give the hours as
    // 5 to 7pm daily; the post confirms 5 to 7pm for its Sunday-to-Wednesday extras.
    id: 'bar-lunatico',
    kind: 'both',
    ...BAR_LUNATICO,
    offer: '$10 happy hour cocktails, $2 off wine and beer, and deals on small plates.',
    days: EVERY_DAY,
    start: '17:00',
    end: '19:00',
    ...LUNATICO_INSTAGRAM,
  },
  {
    id: 'the-swan',
    kind: 'drinks',
    ...THE_SWAN,
    offer: '$5 select drafts, $6 house wine.',
    days: WEEKDAYS,
    start: '15:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
  {
    id: 'therapy-wine-bar-weekdays',
    kind: 'both',
    ...THERAPY_WINE_BAR,
    offer: '$8.25 cocktails, wine and small bites.',
    days: WEEKDAYS,
    start: '16:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
  {
    id: 'therapy-wine-bar-weekend',
    kind: 'both',
    ...THERAPY_WINE_BAR,
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
    kind: 'both',
    ...SELUNE,
    offer: '$1 oysters and $9 wine. Bar seats only.',
    days: [2, 3, 4, 5],
    start: '17:00',
    end: '19:00',
    ...HAPPY_HOUR_NYC,
  },
  {
    // A second guide also lists 4 to 6pm on weekends. Only one source says so,
    // and it is from 2024, so weekends are left out.
    id: 'doris',
    kind: 'drinks',
    ...DORIS,
    offer: '$5 draft beer and $5 well drinks.',
    days: WEEKDAYS,
    start: '17:00',
    end: '19:00',
    ...BK_MAG,
  },
  {
    id: 'pauls',
    kind: 'drinks',
    ...PAULS,
    offer: '$8 beer-and-shot combo, plus deals on beer and well drinks.',
    days: WEEKDAYS,
    start: '15:00',
    end: '20:00',
    ...FIVE_PM_NYC,
  },
  {
    id: 'barbs',
    kind: 'drinks',
    ...BARBS,
    offer: '$5 beer, $5 wine and a $5 Old Fashioned.',
    days: EVERY_DAY,
    start: '17:00',
    end: '20:00',
    ...FIVE_PM_NYC,
  },
  {
    // Two sources agree on the $6 beer-and-shot. The hours come from one.
    id: 'wonderville',
    kind: 'drinks',
    ...WONDERVILLE,
    offer: '$6 beer-and-shot combos, $6 well drinks, $8 frozen drinks.',
    days: WEEKDAYS,
    start: '17:00',
    end: '20:00',
    ...FIVE_PM_NYC,
  },
  {
    // The 2024 post says 4 to 11pm. The bar's profile now gives kitchen hours
    // of 5 to 11pm, so 5pm is the safe start. The specials card is from early
    // 2025 and says $5; Matthew thinks the price has since gone up to $6.
    id: 'the-broadway-burgers',
    kind: 'food',
    ...THE_BROADWAY,
    offer: 'Burger night: $5 burgers, regular or veggie. The price may now be $6.',
    days: [1],
    start: '17:00',
    end: '23:00',
    ...BROADWAY_INSTAGRAM,
  },
  {
    // "All night" is bounded by the kitchen hours on the bar's profile.
    id: 'the-broadway-wings',
    kind: 'food',
    ...THE_BROADWAY,
    offer: 'Wing night: $1 wings, minimum of five.',
    days: [3],
    start: '17:00',
    end: '23:00',
    ...BROADWAY_INSTAGRAM,
  },
  {
    // The bar says "all night". A listing site gives a kitchen close of 11:15pm,
    // so 11pm is the safe end.
    id: 'luckys-wings',
    kind: 'food',
    ...LUCKYS,
    offer: 'Wing night: $1 wings.',
    days: [3],
    start: '16:00',
    end: '23:00',
    ...LUCKYS_WINGS_INSTAGRAM,
  },
  {
    // The bar's own post, from early 2025. Its happy hour (reported noon to 7pm)
    // is still left out because no source gives the days.
    id: 'skytown-brunch',
    kind: 'food',
    ...SKYTOWN,
    offer: '$18 brunch with a free Bloody Mary, mimosa or beer. Posted in early 2025, so the price may have changed.',
    days: WEEKEND,
    start: '12:00',
    end: '16:00',
    ...SKYTOWN_INSTAGRAM,
  },
];
