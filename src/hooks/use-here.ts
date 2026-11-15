import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { Point } from '@/lib/distance';

export type Here =
  | { status: 'loading' }
  | { status: 'ready'; point: Point }
  /** The person said no to sharing location. */
  | { status: 'denied' }
  /** Permission was given but the phone could not get a fix. */
  | { status: 'unavailable' };

const toPoint = (location: Location.LocationObject): Point => ({
  lat: location.coords.latitude,
  lng: location.coords.longitude,
});

/**
 * Where the phone is right now. Asks for permission once, then looks again
 * each time the app comes back to the front.
 *
 * The location is used on the phone to sort the list. It is never sent anywhere.
 */
export function useHere(): Here {
  const [here, setHere] = useState<Here>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function locate() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (!permission.granted) {
          setHere({ status: 'denied' });
          return;
        }

        // A recent fix is instant. Show it, then replace it with a fresh one.
        const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 });
        if (cancelled) return;
        if (last) setHere({ status: 'ready', point: toPoint(last) });

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setHere({ status: 'ready', point: toPoint(current) });
      } catch {
        if (cancelled) return;
        // Keep an earlier fix if there is one.
        setHere((previous) => (previous.status === 'ready' ? previous : { status: 'unavailable' }));
      }
    }

    locate();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') locate();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return here;
}
