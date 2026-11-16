import { useEffect, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deals } from '@/data/deals';
import { useHere, type Here } from '@/hooks/use-here';
import { useTheme } from '@/hooks/use-theme';
import {
  dealsOnNow,
  formatClock,
  formatDate,
  formatMinutes,
  kindLabel,
  matchesFilter,
  nextStartToday,
  type DealFilter,
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
      <ThemedText type="small" themeColor="textSecondary" style={styles.kind}>
        {kindLabel(deal.kind)}
      </ThemedText>
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

const FILTERS: { value: DealFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'food', label: 'Food' },
];

/** Three buttons that narrow the list to drink deals or food deals. */
function FilterChips({
  value,
  onChange,
}: {
  value: DealFilter;
  onChange: (filter: DealFilter) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.chips}>
      {FILTERS.map((filter) => {
        const selected = filter.value === value;
        return (
          <Pressable
            key={filter.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Show ${filter.label.toLowerCase()} deals`}
            hitSlop={4}
            onPress={() => onChange(filter.value)}
            style={[
              styles.chip,
              { backgroundColor: selected ? theme.text : theme.backgroundElement },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: selected ? theme.background : theme.textSecondary }}>
              {filter.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const EMPTY_MESSAGE: Record<DealFilter, string> = {
  all: 'No deals running right now.',
  drinks: 'No drink deals running right now.',
  food: 'No food deals running right now.',
};

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

function EmptyState({ now, filter }: { now: Date; filter: DealFilter }) {
  const next = nextStartToday(
    deals.filter((deal) => matchesFilter(deal.kind, filter)),
    now,
  );
  return (
    <ThemedView style={styles.empty}>
      <ThemedText>{EMPTY_MESSAGE[filter]}</ThemedText>
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
  const [filter, setFilter] = useState<DealFilter>('all');
  const onNow = dealsOnNow(deals, now, here.status === 'ready' ? here.point : null).filter(
    (entry) => matchesFilter(entry.deal.kind, filter),
  );
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
              <FilterChips value={filter} onChange={setFilter} />
            </ThemedView>
          }
          ListEmptyComponent={<EmptyState now={now} filter={filter} />}
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
  chips: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  chip: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  kind: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
    lineHeight: 16,
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
