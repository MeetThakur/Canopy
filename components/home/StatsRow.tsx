import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useStatsStore } from '../../stores/statsStore';

export function StatsRow() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { stats } = useStatsStore();

  const categories = [
    { label: 'Books', count: stats.byCategory.book, color: theme.accentBooks },
    { label: 'Films', count: stats.byCategory.movie, color: theme.accentMovies },
    { label: 'Shows', count: stats.byCategory.tv, color: theme.accentTV },
    { label: 'Games', count: stats.byCategory.game, color: theme.accentGames },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Total card */}
      <View style={[styles.card, styles.totalCard, { backgroundColor: theme.accent + '10', borderColor: theme.accent + '25' }]}>
        <Text style={[styles.totalCount, { color: theme.accent }]}>{stats.totalItems}</Text>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
      </View>
      {categories.map((cat) => (
        <View key={cat.label} style={[styles.card, { backgroundColor: theme.surface2 }]}>
          <View style={[styles.dot, { backgroundColor: cat.color }]} />
          <Text style={[styles.count, { color: theme.textPrimary }]}>{cat.count}</Text>
          <Text style={[styles.label, { color: theme.textTertiary }]}>{cat.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  card: {
    width: 80,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    gap: 4,
  },
  totalCard: {
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  totalCount: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h1 },
  totalLabel: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.micro },
  count: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h2 },
  label: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.micro },
});
