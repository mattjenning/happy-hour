import { useEffect, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deals } from '@/data/deals';
import { useHere, type Here } from '@/hooks/use-here';
import {
  dealsOnNow,
  formatClock,
  formatDate,
  formatMinutes,
  nextStartToday,
  type DealOnNow,
} from '@/lib/deals';
import { formatDistance } from '@/lib/distance';

const NEIGHBORHOOD = 'Bed-Stuy';

/** The current time, refreshed every 30 seconds so the list stays honest. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function DealCard({ entry }: { entry: DealOnNow }) {
  const { deal, minutesLeft } = entry;
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText style={styles.venue}>{deal.venue}</ThemedText>
      <ThemedText>{deal.offer}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Until {formatClock(deal.end)} · {formatMinutes(minutesLeft)} left
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {entry.miles === null ? deal.address : `${formatDistance(entry.miles)} · ${deal.address}`}
      </ThemedText>
      <Pressable
        accessibilityRole="link"
        hitSlop={8}
        onPress={() => Linking.openURL(deal.sourceUrl)}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.source}>
          Source: {deal.sourceName} · checked {formatDate(deal.lastChecked)}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

/** One line that says how the list is ordered, and why. */
function orderLabel(here: Here): string {
  switch (here.status) {
    case 'ready':
      return 'Nearest first';
    case 'loading':
      return 'Finding your location…';
    case 'denied':
      return 'Ending soonest first. Allow location to see the nearest first.';
    case 'unavailable':
      return 'Ending soonest first. Your location is not available right now.';
  }
}

function EmptyState({ now }: { now: Date }) {
  const next = nextStartToday(deals, now);
  return (
    <ThemedView style={styles.empty}>
      <ThemedText>No happy hours running right now.</ThemedText>
      {next ? (
        <ThemedText type="small" themeColor="textSecondary">
          Next: {next.venue} at {formatClock(next.start)}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

export default function NowScreen() {
  const now = useNow();
  const here = useHere();
  const onNow = dealsOnNow(deals, now, here.status === 'ready' ? here.point : null);
  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dayLabel = now.toLocaleDateString([], { weekday: 'long' });

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={onNow}
          keyExtractor={(entry) => entry.deal.id}
          renderItem={({ item }) => <DealCard entry={item} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <ThemedView style={styles.header}>
              <ThemedText type="subtitle">On now</ThemedText>
              <ThemedText themeColor="textSecondary">
                {NEIGHBORHOOD} · {dayLabel} {timeLabel}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {orderLabel(here)}
              </ThemedText>
            </ThemedView>
          }
          ListEmptyComponent={<EmptyState now={now} />}
          ListFooterComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
              Deals come from the sources shown and are not yet confirmed in person. Tap a source
              to see it.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  venue: {
    fontSize: 18,
    fontWeight: 700,
  },
  source: {
    textDecorationLine: 'underline',
  },
  footer: {
    paddingTop: Spacing.three,
  },
  empty: {
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
});
