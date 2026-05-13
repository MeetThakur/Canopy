import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Trophy, TrendingUp, Book, Film, Tv, Gamepad2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';
import { Card } from '../../components/ui/Card';

const ACHIEVEMENTS = [
  { id: 'first', label: 'First Item Logged', icon: '🌱', condition: (t: number) => t >= 1 },
  { id: 'movie_buff', label: 'Movie Buff', icon: '🎬', condition: (_: number, movies: number) => movies >= 10 },
  { id: 'bookworm', label: 'Bookworm', icon: '📚', condition: (_: number, __: number, books: number) => books >= 10 },
  { id: 'completionist', label: 'Completionist', icon: '🏆', condition: (t: number) => t >= 50 },
  { id: 'gamer', label: 'Gamer', icon: '🎮', condition: (_: number, __: number, ___: number, games: number) => games >= 5 },
];

function StatBlock({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.statBlock, { backgroundColor: theme.surface2 }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>{icon}</View>
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
  const allItems = useLibraryStore((s) => s.getItems());

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
            <Settings size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.accentBooks }]}>
            <Text style={styles.avatarText}>YO</Text>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>Your Library</Text>
          <Text style={[styles.userSub, { color: theme.textSecondary }]}>{stats.totalItems} items tracked</Text>
        </View>

        {/* Category Stats */}
        <View style={styles.statsGrid}>
          <StatBlock icon={<Book size={18} color={theme.accentBooks} />} label="Books" value={stats.byCategory.book} color={theme.accentBooks} />
          <StatBlock icon={<Film size={18} color={theme.accentMovies} />} label="Movies" value={stats.byCategory.movie} color={theme.accentMovies} />
          <StatBlock icon={<Tv size={18} color={theme.accentTV} />} label="TV Shows" value={stats.byCategory.tv} color={theme.accentTV} />
          <StatBlock icon={<Gamepad2 size={18} color={theme.accentGames} />} label="Games" value={stats.byCategory.game} color={theme.accentGames} />
        </View>

        {/* Status breakdown */}
        <Card style={[styles.card, { borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Overview</Text>
          {([
            { label: 'Completed', val: stats.byStatus.completed, color: theme.success },
            { label: 'In Progress', val: stats.byStatus.inprogress, color: theme.accentMovies },
            { label: 'Want to Read/Watch/Play', val: stats.byStatus.want, color: theme.textTertiary },
          ] as const).map((row) => (
            <View key={row.label} style={styles.overviewRow}>
              <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.overviewVal, { color: row.color }]}>{row.val}</Text>
            </View>
          ))}
        </Card>

        {/* Year in Review */}
        <Card style={[styles.yearCard, { borderColor: theme.accentBooks + '40', backgroundColor: theme.accentBooks + '10' }]}>
          <TrendingUp size={24} color={theme.accentBooks} />
          <Text style={[styles.yearTitle, { color: theme.textPrimary }]}>Year in Review {year}</Text>
          <Text style={[styles.yearSub, { color: theme.textSecondary }]}>
            You've tracked{' '}
            <Text style={{ color: theme.accentBooks, fontFamily: Typography.fontFamily.primaryBold }}>
              {thisYearItems.length}
            </Text>{' '}
            {thisYearItems.length === 1 ? 'item' : 'items'} this year. Keep it up!
          </Text>
        </Card>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={16} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Achievements</Text>
          </View>
          <View style={styles.badgesGrid}>
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedAchievements.find((e) => e.id === a.id);
              return (
                <View key={a.id} style={[styles.badge, { backgroundColor: earned ? theme.surface : theme.surface2, borderColor: earned ? theme.accentBooks : theme.border, opacity: earned ? 1 : 0.4 }]}>
                  <Text style={styles.badgeIcon}>{a.icon}</Text>
                  <Text style={[styles.badgeLabel, { color: theme.textSecondary }]} numberOfLines={2}>{a.label}</Text>
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
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  pageTitle: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.display },
  iconBtn: { width: 38, height: 38, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h1, color: '#FFF' },
  userName: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h2 },
  userSub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.md },
  statBlock: { flex: 1, minWidth: '44%', borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.xs, alignItems: 'center' },
  statIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h1 },
  statLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption },
  card: { marginHorizontal: Spacing.md, padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1 },
  cardTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.h3, marginBottom: Spacing.xs },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  overviewLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
  overviewVal: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.body },
  yearCard: { marginHorizontal: Spacing.md, padding: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg, borderWidth: 1, borderRadius: BorderRadius.lg },
  yearTitle: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h3 },
  yearSub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, lineHeight: 22 },
  section: { paddingHorizontal: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: 'uppercase', letterSpacing: 0.8 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge: { width: '30%', borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', gap: Spacing.xs, borderWidth: 1 },
  badgeIcon: { fontSize: 24 },
  badgeLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption, textAlign: 'center' },
});
