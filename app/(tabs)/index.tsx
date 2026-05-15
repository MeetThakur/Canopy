import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Plus, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';
import { MediaItem } from '../../types/media';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Editorial Hero Card ──────────────────────────────────────────────────────

function HeroCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={styles.heroCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`Continue ${item.title}`}
    >
      <View style={styles.heroImageWrap}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', isDark ? '#000000' : '#FFFFFF']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      <View style={styles.heroContent}>
        <View style={[styles.heroPill, { borderColor: theme.textPrimary }]}>
          <Text style={[styles.heroPillText, { color: theme.textPrimary }]}>
            {item.status === 'inprogress' ? 'CONTINUE' : 'FEATURED'}
          </Text>
        </View>
        <Text style={[styles.heroTitle, { color: theme.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Editorial Grid Card ──────────────────────────────────────────────────────

function GridCard({ item, onPress, isTall = false }: { item: MediaItem; onPress: () => void; isTall?: boolean }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.gridCard, { height: isTall ? 280 : 200 }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridType}>{item.type.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Minimal List Row ─────────────────────────────────────────────────────────

function ListRow({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.listRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <Text style={[styles.listTitle, { color: theme.textPrimary }]} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.listRight}>
        <Text style={[styles.listType, { color: theme.textTertiary }]}>{item.type}</Text>
        <ArrowRight size={16} color={theme.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

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
  const heroItem = inProgress[0] ?? allItems[0] ?? null;
  
  // Grid items: next 4 items
  const gridItems = useMemo(() => allItems.filter(i => i.id !== heroItem?.id).slice(0, 4), [allItems, heroItem]);
  
  // List items: next 5 items after grid
  const listItems = useMemo(() => allItems.filter(i => i.id !== heroItem?.id).slice(4, 9), [allItems, heroItem]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculateStats();
    setTimeout(() => setRefreshing(false), 600);
  }, [recalculateStats]);

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
          <Text style={[styles.logo, { color: theme.textPrimary }]}>Kanopi</Text>
          <TouchableOpacity
            style={[styles.addBtn, { borderColor: theme.border }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={20} color={theme.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* ── Editorial Stats ── */}
        <View style={styles.statsStrip}>
          <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.totalItems}</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>Works in Collection</Text>
        </View>

        {/* ── Hero Section ── */}
        {heroItem ? (
          <View style={styles.heroSection}>
            <HeroCard item={heroItem} onPress={() => router.push(`/media/${heroItem.id}`)} />
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <TouchableOpacity
              style={[styles.emptyCard, { borderColor: theme.border }]}
              onPress={() => setSheetVisible(true)}
            >
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Your library is empty.
              </Text>
              <Text style={[styles.emptySub, { color: theme.textTertiary }]}>
                Tap to add your first work.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Masonry/Bento Grid ── */}
        {gridItems.length > 0 && (
          <View style={styles.gridSection}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>UPCOMING</Text>
            <View style={styles.gridContainer}>
              <View style={styles.gridColumn}>
                {gridItems.filter((_, i) => i % 2 === 0).map((item, index) => (
                  <GridCard 
                    key={item.id} 
                    item={item} 
                    onPress={() => router.push(`/media/${item.id}`)} 
                    isTall={index === 0} 
                  />
                ))}
              </View>
              <View style={styles.gridColumn}>
                {gridItems.filter((_, i) => i % 2 !== 0).map((item, index) => (
                  <GridCard 
                    key={item.id} 
                    item={item} 
                    onPress={() => router.push(`/media/${item.id}`)} 
                    isTall={index === 1} // Alternate tall card
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Text-heavy List ── */}
        {listItems.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>RECENTLY ADDED</Text>
            <View style={styles.listContainer}>
              {listItems.map((item) => (
                <ListRow key={item.id} item={item} onPress={() => router.push(`/media/${item.id}`)} />
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 10, paddingBottom: 10,
  },
  logo: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 34,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },

  // Stats
  statsStrip: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    paddingHorizontal: Spacing.md, marginBottom: 24,
  },
  statNumber: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 48, lineHeight: 52,
  },
  statText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    textTransform: 'uppercase', letterSpacing: 1,
  },

  // Hero
  heroSection: { paddingHorizontal: Spacing.md, marginBottom: 40 },
  heroCard: {
    width: '100%',
  },
  heroImageWrap: {
    width: '100%', aspectRatio: 1,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    marginBottom: -40, // Pulls content up over the fade
  },
  heroContent: {
    paddingHorizontal: 16,
  },
  heroPill: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, marginBottom: 12,
  },
  heroPillText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.micro, letterSpacing: 1.5,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 38, lineHeight: 42,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },

  // Grid
  gridSection: { paddingHorizontal: Spacing.md, marginBottom: 40 },
  sectionHeading: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.caption,
    letterSpacing: 2, marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row', gap: 12,
  },
  gridColumn: {
    flex: 1, gap: 12,
  },
  gridCard: {
    width: '100%', borderRadius: BorderRadius.md, overflow: 'hidden',
    backgroundColor: '#111', justifyContent: 'flex-end',
  },
  gridContent: { padding: 12 },
  gridTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.body, color: '#FFF',
    marginBottom: 4,
  },
  gridType: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.micro, color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },

  // List
  listSection: { paddingHorizontal: Spacing.md },
  listContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333', // fallback, overridden in inline style
  },
  listRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listTitle: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.body, flex: 1, marginRight: 16,
  },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listType: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption, textTransform: 'uppercase',
  },

  // Empty
  emptyWrap: { paddingHorizontal: Spacing.md, marginBottom: 40 },
  emptyCard: {
    width: '100%', paddingVertical: 60,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body, marginBottom: 4 },
  emptySub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
});
