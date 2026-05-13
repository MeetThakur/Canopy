import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useStatsStore } from '../../stores/statsStore';
import { Book, Film, Tv, Gamepad2 } from 'lucide-react-native';
import { Card } from '../ui/Card';

export function StatsRow() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { stats } = useStatsStore();

  const categories = [
    { type: 'book', label: 'Books', count: stats.byCategory.book, icon: Book, color: theme.accentBooks },
    { type: 'movie', label: 'Movies', count: stats.byCategory.movie, icon: Film, color: theme.accentMovies },
    { type: 'tv', label: 'TV Shows', count: stats.byCategory.tv, icon: Tv, color: theme.accentTV },
    { type: 'game', label: 'Games', count: stats.byCategory.game, icon: Gamepad2, color: theme.accentGames },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <TouchableOpacity key={cat.type} onPress={() => {}}>
            <Card style={[styles.card, { borderColor: theme.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                <Icon size={20} color={cat.color} />
              </View>
              <View>
                <Text style={[styles.count, { color: theme.textPrimary }]}>{cat.count}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{cat.label}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  card: {
    width: 120,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h2,
  },
  label: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
  },
});
