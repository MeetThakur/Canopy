import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Plus, ChevronRight, BookOpen, Tv, Gamepad2, Film } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';
import { MediaItem, MediaType } from '../../types/media';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 32;

function typeIcon(type: MediaType, color: string, size = 13) {
  if (type === 'book') return <BookOpen size={size} color={color} />;
  if (type === 'movie') return <Film size={size} color={color} />;
  if (type === 'tv') return <Tv size={size} color={color} />;
  return <Gamepad2 size={size} color={color} />;
}

// ─── Featured wide card ───────────────────────────────────────────────────────

function FeaturedCard({ item, onPress, accent }: { item: MediaItem; onPress: () => void; accent: string }) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={item.title}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.featuredInner}>
        <View style={[styles.featuredTypePill, { backgroundColor: accent + '30' }]}>
          {typeIcon(item.type, accent, 11)}
          <Text style={[styles.featuredTypeText, { color: accent }]}>
            {item.type === 'book' ? 'Book' : item.type === 'movie' ? 'Film' : item.type === 'tv' ? 'Show' : 'Game'}
          </Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.featuredSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Compact in-progress card ─────────────────────────────────────────────────

function CompactCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
      style={[styles.compactCard, { backgroundColor: theme.surface }]}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={styles.compactCover}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.compactMeta}>
        <Text style={[styles.compactTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.compactSub, { color: theme.textTertiary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={14} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Category stat block ──────────────────────────────────────────────────────

function StatBlock({ label, count, color, bgColor }: { label: string; count: number; color: string; bgColor: string }) {
  return (
    <View style={[styles.statBlock, { backgroundColor: bgColor }]}>
      <Text style={[styles.statBlockNum, { color }]}>{count}</Text>
      <Text style={[styles.statBlockLabel, { color: color + 'AA' }]}>{label}</Text>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const itemsMap = useLibraryStore((s) => s.items);
  const { stats, recalculateStats } = useStatsStore();
  const [refreshing, setRefreshing] = useState(false);

  const allItems = useMemo(
    () => Object.values(itemsMap).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
    [itemsMap]
  );

  const inProgress = useMemo(() => allItems.filter((i) => i.status === 'inprogress'), [allItems]);
  const wantItems = useMemo(() => allItems.filter((i) => i.status === 'want').slice(0, 4), [allItems]);
  const featuredItem = inProgress[0] ?? null;
  const otherInProgress = inProgress.slice(1, 4);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculateStats();
    setTimeout(() => setRefreshing(false), 600);
  }, [recalculateStats]);

  const statData = [
    { label: 'Books', count: stats.byCategory.book, color: theme.accentBooks, bg: theme.accentBooks + '12' },
    { label: 'Films', count: stats.byCategory.movie, color: theme.accentMovies, bg: theme.accentMovies + '12' },
    { label: 'Shows', count: stats.byCategory.tv, color: theme.accentTV, bg: theme.accentTV + '12' },
    { label: 'Games', count: stats.byCategory.game, color: theme.accentGames, bg: theme.accentGames + '12' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textTertiary} />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.textPrimary }]}>KANOPI</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── Stats 2×2 grid ── */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {statData.slice(0, 2).map((s) => (
              <StatBlock key={s.label} label={s.label} count={s.count} color={s.color} bgColor={s.bg} />
            ))}
          </View>
          <View style={styles.statsRow}>
            {statData.slice(2).map((s) => (
              <StatBlock key={s.label} label={s.label} count={s.count} color={s.color} bgColor={s.bg} />
            ))}
          </View>
        </View>

        {/* ── In Progress ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              IN PROGRESS
            </Text>
            {inProgress.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/library')} style={styles.seeAllBtn}>
                <Text style={[styles.seeAll, { color: theme.accent }]}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {featuredItem ? (
            <View style={styles.featuredSection}>
              <FeaturedCard
                item={featuredItem}
                onPress={() => router.push(`/media/${featuredItem.id}`)}
                accent={theme.accent}
              />
              {otherInProgress.length > 0 && (
                <View style={styles.compactList}>
                  {otherInProgress.map((item) => (
                    <CompactCard
                      key={item.id}
                      item={item}
                      onPress={() => router.push(`/media/${item.id}`)}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.emptyCard, { borderColor: theme.border }]}
              onPress={() => setSheetVisible(true)}
            >
              <Plus size={22} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                Nothing in progress yet
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Want to ── */}
        {wantItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                UP NEXT
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wantRow}
            >
              {wantItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.wantCard}
                  onPress={() => router.push(`/media/${item.id}`)}
                  accessibilityLabel={item.title}
                >
                  <Image
                    source={{ uri: item.coverUrl || undefined }}
                    style={styles.wantCover}
                    contentFit="cover"
                    transition={200}
                  />
                  <Text style={[styles.wantTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <AddMediaSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 20, paddingBottom: Spacing.md,
  },
  logo: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 28,
    letterSpacing: 6,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },

  // Stats
  statsContainer: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.xl,
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBlock: {
    flex: 1, paddingVertical: 18, paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  statBlockNum: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 28,
    lineHeight: 32,
  },
  statBlockLabel: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Sections
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
    letterSpacing: 2,
  },
  seeAllBtn: {},
  seeAll: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },

  // Featured
  featuredSection: { paddingHorizontal: Spacing.md, gap: 10 },
  featuredCard: {
    width: '100%', height: 220,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    backgroundColor: '#1C1C2E',
    justifyContent: 'flex-end',
  },
  featuredInner: { padding: 20, gap: 6 },
  featuredTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  featuredTypeText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.h1,
    color: '#FFF',
    lineHeight: 30,
  },
  featuredSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255,255,255,0.55)',
  },

  // Compact card
  compactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 10, borderRadius: BorderRadius.sm,
  },
  compactCover: { width: 40, height: 56, borderRadius: 6 },
  compactMeta: { flex: 1 },
  compactTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  compactSub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall, marginTop: 2 },
  compactList: { gap: 2 },

  // Empty state
  emptyCard: {
    marginHorizontal: Spacing.md, height: 130,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  emptyText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },

  // Want row
  wantRow: { paddingHorizontal: Spacing.md, gap: 12 },
  wantCard: { width: 100 },
  wantCover: {
    width: 100, height: 150, borderRadius: BorderRadius.sm,
    marginBottom: 6, backgroundColor: '#1C1C2E',
  },
  wantTitle: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: 12, lineHeight: 16 },
});
