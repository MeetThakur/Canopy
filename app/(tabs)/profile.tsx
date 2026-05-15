import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Award, TrendingUp, Book, Film, Tv, Gamepad2, Sprout, Clapperboard, Swords, Crown } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';

const ACHIEVEMENTS = [
  { id: 'first', label: 'First Entry', Icon: Sprout, condition: (t: number) => t >= 1 },
  { id: 'movie_buff', label: 'Cinephile', Icon: Clapperboard, condition: (_: number, movies: number) => movies >= 10 },
  { id: 'bookworm', label: 'Bookworm', Icon: Book, condition: (_: number, __: number, books: number) => books >= 10 },
  { id: 'completionist', label: 'Completionist', Icon: Crown, condition: (t: number) => t >= 50 },
  { id: 'gamer', label: 'Player One', Icon: Swords, condition: (_: number, __: number, ___: number, games: number) => games >= 5 },
];

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.statPill, { backgroundColor: theme.surface2 }]}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textTertiary }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const { stats } = useStatsStore();
  const itemsMap = useLibraryStore((s) => s.items);
  const allItems = React.useMemo(() => {
    return Object.values(itemsMap).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [itemsMap]);

  const year = new Date().getFullYear();
  const thisYearItems = allItems.filter((i) => i.createdAt && new Date(i.createdAt).getFullYear() === year);

  const earnedAchievements = ACHIEVEMENTS.filter((a) =>
    a.condition(stats.totalItems, stats.byCategory.movie, stats.byCategory.book, stats.byCategory.game)
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface2 }]}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Open settings"
          >
            <Settings size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.accent + '15' }]}>
            <Text style={[styles.avatarLetter, { color: theme.accent }]}>K</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>{stats.totalItems} items tracked</Text>
            <Text style={[styles.summarySub, { color: theme.textTertiary }]}>{thisYearItems.length} added in {year}</Text>
          </View>
        </View>

        {/* Category breakdown */}
        <View style={styles.pillsRow}>
          <StatPill icon={<Book size={14} color={theme.accentBooks} />} label="Books" value={stats.byCategory.book} color={theme.accentBooks} />
          <StatPill icon={<Film size={14} color={theme.accentMovies} />} label="Films" value={stats.byCategory.movie} color={theme.accentMovies} />
          <StatPill icon={<Tv size={14} color={theme.accentTV} />} label="Shows" value={stats.byCategory.tv} color={theme.accentTV} />
          <StatPill icon={<Gamepad2 size={14} color={theme.accentGames} />} label="Games" value={stats.byCategory.game} color={theme.accentGames} />
        </View>

        {/* Status overview */}
        <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {([
            { label: 'Completed', val: stats.byStatus.completed, color: theme.success },
            { label: 'In Progress', val: stats.byStatus.inprogress, color: theme.accent },
            { label: 'Wishlist', val: stats.byStatus.want, color: theme.textTertiary },
          ] as const).map((row, i, arr) => (
            <View key={row.label} style={[styles.overviewRow, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
              <View style={styles.overviewLeft}>
                <View style={[styles.overviewDot, { backgroundColor: row.color }]} />
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>{row.label}</Text>
              </View>
              <Text style={[styles.overviewVal, { color: theme.textPrimary }]}>{row.val}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={14} color={theme.textTertiary} />
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Achievements</Text>
          </View>
          <View style={styles.badgesGrid}>
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedAchievements.find((e) => e.id === a.id);
              const AIcon = a.Icon;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: earned ? theme.accent + '10' : theme.surface2,
                      borderColor: earned ? theme.accent + '30' : 'transparent',
                      opacity: earned ? 1 : 0.35,
                    },
                  ]}
                >
                  <AIcon size={20} color={earned ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.badgeLabel, { color: earned ? theme.textPrimary : theme.textTertiary }]} numberOfLines={1}>{a.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 80 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: Spacing.sm,
  },
  pageTitle: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.display },
  iconBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1,
  },
  avatarCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontFamily: Typography.fontFamily.heading, fontSize: 22 },
  summaryText: { gap: 2 },
  summaryTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.h3 },
  summarySub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
  pillsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 8, marginBottom: Spacing.md,
  },
  statPill: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: BorderRadius.sm, gap: 4,
  },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statValue: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h2 },
  statLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.micro },
  overviewCard: {
    marginHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1,
    marginBottom: Spacing.lg, overflow: 'hidden',
  },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  overviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overviewDot: { width: 8, height: 8, borderRadius: 4 },
  overviewLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
  overviewVal: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  section: { paddingHorizontal: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  sectionTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: 'uppercase', letterSpacing: 1 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.sm, borderWidth: 1,
  },
  badgeLabel: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
});
