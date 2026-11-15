/**
 * Distance between two places on the map. Pure logic, no screen or phone code.
 */

export type Point = { lat: number; lng: number };

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Straight-line distance in miles (the haversine formula).
 * Walking distance along streets is a little longer.
 */
export function milesBetween(a: Point, b: Point): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/** 0.04 becomes "under 0.1 mi", 0.44 becomes "0.4 mi", 12.3 becomes "12 mi". */
export function formatDistance(miles: number): string {
  if (miles < 0.05) return 'under 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
