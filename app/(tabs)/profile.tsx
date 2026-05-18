import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Award, Book, Film, Tv, Gamepad2, Sprout, Clapperboard, Swords, Crown, TrendingUp, Zap, CheckCircle2, Circle, Clock } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';

const { width: SCREEN_W } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: 'first',         label: 'First Entry',     desc: 'Add 1 item',      Icon: Sprout,      condition: (t: number) => t >= 1 },
  { id: 'movie_buff',    label: 'Cinephile',        desc: '10 movies',        Icon: Clapperboard,condition: (_: number, m: number) => m >= 10 },
  { id: 'bookworm',      label: 'Bookworm',         desc: '10 books',         Icon: Book,        condition: (_: number, __: number, b: number) => b >= 10 },
  { id: 'completionist', label: 'Completionist',    desc: '50 items total',   Icon: Crown,       condition: (t: number) => t >= 50 },
  { id: 'gamer',         label: 'Player One',       desc: '5 games',          Icon: Swords,      condition: (_: number, __: number, ___: number, g: number) => g >= 5 },
];

const CATEGORY_COLORS = (theme: any) => [
  { label: 'Books',  value: 'book',  color: theme.accentBooks,  Icon: Book },
  { label: 'Films',  value: 'movie', color: theme.accentMovies, Icon: Film },
  { label: 'Shows',  value: 'tv',    color: theme.accentTV,     Icon: Tv },
  { label: 'Games',  value: 'game',  color: theme.accentGames,  Icon: Gamepad2 },
];

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const { stats } = useStatsStore();
  const itemsMap = useLibraryStore((s) => s.items);

  const allItems = React.useMemo(() =>
    Object.values(itemsMap).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  [itemsMap]);

  const year = new Date().getFullYear();
  const thisYearItems = allItems.filter((i) => i.createdAt && new Date(i.createdAt).getFullYear() === year);

  const topGenre = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach(item => item.genre?.forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? '—';
  }, [allItems]);

  const topMonth = React.useMemo(() => {
    const counts: Record<number, number> = {};
    thisYearItems.forEach(item => {
      if (!item.createdAt) return;
      const m = new Date(item.createdAt).getMonth();
      counts[m] = (counts[m] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return '—';
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+sorted[0][0]];
  }, [thisYearItems]);

  const earnedIds = new Set(
    ACHIEVEMENTS.filter(a => a.condition(stats.totalItems, stats.byCategory.movie, stats.byCategory.book, stats.byCategory.game)).map(a => a.id)
  );

  const total = stats.totalItems || 1;
  const cats = CATEGORY_COLORS(theme);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textTertiary }]}>Your journey</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
          </View>
          <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: theme.surface }]} onPress={() => router.push('/settings')}>
            <Settings size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Hero card ──────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accentBooks + '20' }]}>
            <Text style={[styles.avatarLetter, { color: theme.accentBooks }]}>K</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroCount, { color: theme.textPrimary }]}>{stats.totalItems}</Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>items in your collection</Text>
            <Text style={[styles.heroYear, { color: theme.textTertiary }]}>{thisYearItems.length} added in {year}</Text>
          </View>
        </View>

        {/* ── Category cards ─────────────── */}
        <View style={styles.catGrid}>
          {cats.map(({ label, value, color, Icon }) => {
            const count = stats.byCategory[value as keyof typeof stats.byCategory] ?? 0;
            const pct = Math.round((count / total) * 100);
            return (
              <View key={value} style={[styles.catCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.catIcon, { backgroundColor: color + '15' }]}>
                  <Icon size={16} color={color} />
                </View>
                <Text style={[styles.catCount, { color: theme.textPrimary }]}>{count}</Text>
                <Text style={[styles.catLabel, { color: theme.textTertiary }]}>{label}</Text>
                <View style={[styles.catBar, { backgroundColor: theme.surface2 }]}>
                  <View style={[styles.catBarFill, { backgroundColor: color, width: `${Math.max(pct, 4)}%` as any }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Status ─────────────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Status</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { label: 'Completed',  val: stats.byStatus.completed,  color: theme.success,      Icon: CheckCircle2 },
            { label: 'In Progress',val: stats.byStatus.inprogress, color: theme.accentBooks,  Icon: Clock },
            { label: 'Wishlist',   val: stats.byStatus.want,       color: theme.textTertiary, Icon: Circle },
          ].map((row, i, arr) => {
            const RowIcon = row.Icon;
            return (
              <View key={row.label} style={[styles.statusRow, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
                <View style={[styles.statusIconWrap, { backgroundColor: row.color + '15' }]}>
                  <RowIcon size={14} color={row.color} />
                </View>
                <Text style={[styles.statusLabel, { color: theme.textSecondary, flex: 1 }]}>{row.label}</Text>
                <Text style={[styles.statusVal, { color: theme.textPrimary }]}>{row.val}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Insights ───────────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Insights</Text>
        <View style={styles.insightsRow}>
          <View style={[styles.insightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TrendingUp size={20} color={theme.accentBooks} />
            <Text style={[styles.insightVal, { color: theme.textPrimary }]} numberOfLines={1}>{topGenre}</Text>
            <Text style={[styles.insightLabel, { color: theme.textTertiary }]}>Top Genre</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Zap size={20} color={theme.accentMovies} />
            <Text style={[styles.insightVal, { color: theme.textPrimary }]}>{topMonth}</Text>
            <Text style={[styles.insightLabel, { color: theme.textTertiary }]}>Most Active</Text>
          </View>
        </View>

        {/* ── Achievements ───────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Achievements</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {ACHIEVEMENTS.map((a, i, arr) => {
            const earned = earnedIds.has(a.id);
            const AIcon = a.Icon;
            return (
              <View key={a.id} style={[styles.achRow, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
                <View style={[styles.achIcon, { backgroundColor: earned ? theme.accentBooks + '15' : theme.surface2 }]}>
                  <AIcon size={16} color={earned ? theme.accentBooks : theme.textTertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.achLabel, { color: earned ? theme.textPrimary : theme.textTertiary }]}>{a.label}</Text>
                  <Text style={[styles.achDesc, { color: theme.textTertiary }]}>{a.desc}</Text>
                </View>
                <View style={[styles.achBadge, { backgroundColor: earned ? theme.accentBooks + '15' : theme.surface2 }]}>
                  <Text style={[styles.achBadgeText, { color: earned ? theme.accentBooks : theme.textTertiary }]}>{earned ? 'Earned' : 'Locked'}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (SCREEN_W - Spacing.md * 2 - Spacing.sm * 3) / 4;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, marginBottom: Spacing.md },
  greeting: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall, marginBottom: 2 },
  title: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 30, letterSpacing: -1 },
  settingsBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  heroCard: { marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 26 },
  heroCount: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 32, letterSpacing: -1 },
  heroSub: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  heroYear: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption, marginTop: 2 },
  catGrid: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  catCard: { flex: 1, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 4 },
  catIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  catCount: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 20 },
  catLabel: { fontFamily: Typography.fontFamily.primary, fontSize: 10 },
  catBar: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  catBarFill: { height: 3, borderRadius: 2 },
  sectionLabel: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  card: { marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', marginBottom: Spacing.lg },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  statusIconWrap: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statusLabel: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  statusVal: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.body },
  insightsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  insightCard: { flex: 1, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 6 },
  insightVal: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 20, letterSpacing: -0.5 },
  insightLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption },
  achRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  achIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  achLabel: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  achDesc: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption, marginTop: 1 },
  achBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  achBadgeText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: 10 },
});
