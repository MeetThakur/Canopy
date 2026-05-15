import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Plus, ArrowRight, BookOpen, Tv, Gamepad2, Film, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';
import { MediaItem, MediaType } from '../../types/media';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Helper ──────────────────────────────────────────────────────────────────

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function mediaVerb(type: MediaType) {
  if (type === 'book') return 'Reading';
  if (type === 'movie') return 'Watching';
  if (type === 'tv') return 'Watching';
  return 'Playing';
}

function typeIcon(type: MediaType, color: string, size = 14) {
  if (type === 'book') return <BookOpen size={size} color={color} />;
  if (type === 'movie') return <Film size={size} color={color} />;
  if (type === 'tv') return <Tv size={size} color={color} />;
  return <Gamepad2 size={size} color={color} />;
}

// ─── Hero featured card ───────────────────────────────────────────────────────

function HeroCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={styles.heroCard}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityLabel={`Continue: ${item.title}`}
    >
      {/* Blurred background */}
      {item.coverUrl ? (
        <Image
          source={{ uri: item.coverUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={22}
        />
      ) : null}
      {/* Gradient overlay */}
      <View style={styles.heroOverlay} />

      {/* Content */}
      <View style={styles.heroContent}>
        {/* Cover */}
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.heroCover}
          contentFit="cover"
          transition={0}
        />
        {/* Meta */}
        <View style={styles.heroMeta}>
          <View style={[styles.heroTypePill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            {typeIcon(item.type, 'rgba(255,255,255,0.85)', 11)}
            <Text style={styles.heroTypeText}>
              {mediaVerb(item.type)}
            </Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.heroSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.heroCta}
            onPress={onPress}
          >
            <Text style={[styles.heroCtaText, { color: theme.accent }]}>Continue</Text>
            <ArrowRight size={13} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Compact cover card ───────────────────────────────────────────────────────

function ContinueCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity style={styles.continueCard} onPress={onPress} accessibilityLabel={item.title}>
      <View style={styles.continueImgWrap}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.continueImg}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text style={[styles.continueTitle, { color: theme.textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text style={[styles.continueSubtitle, { color: theme.textTertiary }]} numberOfLines={1}>
          {item.subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Recent item row ──────────────────────────────────────────────────────────

function RecentRow({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const statusLabel = {
    want: 'Want to',
    inprogress: 'In Progress',
    completed: 'Completed',
  }[item.status];

  const statusColor = {
    want: theme.textTertiary,
    inprogress: theme.accent,
    completed: theme.success,
  }[item.status];

  return (
    <TouchableOpacity
      style={[styles.recentRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={[styles.recentCover, { backgroundColor: theme.surface2 }]}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.recentInfo}>
        <Text style={[styles.recentTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.recentSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
        <Text style={[styles.recentStatus, { color: statusColor }]}>{statusLabel}</Text>
      </View>
      <ChevronRight size={16} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

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
  const heroItem = inProgress[0] ?? null;
  const moreInProgress = inProgress.slice(1, 5);
  const recentItems = useMemo(
    () => allItems.filter((i) => i !== heroItem).slice(0, 6),
    [allItems, heroItem]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculateStats();
    setTimeout(() => setRefreshing(false), 700);
  }, [recalculateStats]);

  const statItems = [
    { label: 'Books', count: stats.byCategory.book, color: theme.accentBooks },
    { label: 'Films', count: stats.byCategory.movie, color: theme.accentMovies },
    { label: 'Shows', count: stats.byCategory.tv, color: theme.accentTV },
    { label: 'Games', count: stats.byCategory.game, color: theme.accentGames },
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
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.textTertiary }]}>
              {greet()}
            </Text>
            <Text style={[styles.appName, { color: theme.textPrimary }]}>Kanopi</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── Date strip ── */}
        <Text style={[styles.dateStrip, { color: theme.textTertiary }]}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>

        {/* ── Stats grid ── */}
        <View style={[styles.statsGrid, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          <View style={[styles.statTotal, { borderRightColor: theme.border }]}>
            <Text style={[styles.statTotalNum, { color: theme.textPrimary }]}>{stats.totalItems}</Text>
            <Text style={[styles.statTotalLabel, { color: theme.textTertiary }]}>Total</Text>
          </View>
          <View style={styles.statCols}>
            {statItems.map((s, i) => (
              <View
                key={s.label}
                style={[
                  styles.statCol,
                  i < statItems.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: theme.border },
                ]}
              >
                <Text style={[styles.statNum, { color: s.color }]}>{s.count}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Currently in progress ── */}
        {heroItem ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>In Progress</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/library')}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAll, { color: theme.textTertiary }]}>Library</Text>
                <ChevronRight size={13} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>
            <HeroCard item={heroItem} onPress={() => router.push(`/media/${heroItem.id}`)} />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.emptyHero, { backgroundColor: theme.surface2, borderColor: theme.border }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add your first item"
          >
            <Plus size={24} color={theme.textTertiary} />
            <Text style={[styles.emptyHeroText, { color: theme.textTertiary }]}>
              Add something to get started
            </Text>
          </TouchableOpacity>
        )}

        {/* ── More in progress ── */}
        {moreInProgress.length > 0 && (
          <View style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueRow}
            >
              {moreInProgress.map((item) => (
                <ContinueCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recent items ── */}
        {recentItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent</Text>
            </View>
            <View style={[styles.recentList, { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              {recentItems.map((item) => (
                <RecentRow
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <AddMediaSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: 16, paddingBottom: 4,
  },
  headerLeft: { gap: 2 },
  greeting: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },
  appName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.display,
    lineHeight: 34,
  },
  dateStrip: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },

  // Stats grid
  statsGrid: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  statTotal: {
    width: 80,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statTotalNum: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 30,
    lineHeight: 34,
  },
  statTotalLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statCols: { flex: 1, flexDirection: 'row' },
  statCol: {
    flex: 1, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statNum: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h2 },
  statLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.micro },

  // Sections
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: 12,
  },
  sectionTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.h3 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },

  // Hero card
  heroCard: {
    marginHorizontal: Spacing.md,
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#1C1917',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  heroContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, gap: 16,
  },
  heroCover: {
    width: 100, height: 150, borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  heroMeta: { flex: 1, gap: 8 },
  heroTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  heroTypeText: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.caption,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.h2,
    color: '#FFF',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255,255,255,0.65)',
  },
  heroCta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginTop: 4,
  },
  heroCtaText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },

  // Empty hero
  emptyHero: {
    marginHorizontal: Spacing.md, height: 120,
    borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: Spacing.xl,
  },
  emptyHeroText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },

  // Continue row
  continueRow: { paddingHorizontal: Spacing.md, gap: 14 },
  continueCard: { width: 110 },
  continueImgWrap: {
    width: 110, height: 160, borderRadius: BorderRadius.sm,
    overflow: 'hidden', backgroundColor: '#2E2C2A', marginBottom: 6,
  },
  continueImg: { width: '100%', height: '100%' },
  continueTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: 12, lineHeight: 16 },
  continueSubtitle: { fontFamily: Typography.fontFamily.primary, fontSize: 11, marginTop: 2 },

  // Recent list
  recentList: {},
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentCover: { width: 44, height: 62, borderRadius: 6 },
  recentInfo: { flex: 1 },
  recentTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  recentSubtitle: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall, marginTop: 2 },
  recentStatus: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.caption, marginTop: 4 },
});
