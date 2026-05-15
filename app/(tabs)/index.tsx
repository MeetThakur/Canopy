import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';
import { MediaItem } from '../../types/media';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Minimal Carousel Card ──────────────────────────────────────────────────

function CarouselCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={styles.carouselCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={item.title}
    >
      <View style={styles.carouselCoverWrap}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.carouselCover}
          contentFit="cover"
          transition={200}
        />
        {/* Subtle overlay for contrast if needed, but keeping it raw and clean */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.05)' }]} />
      </View>
      
      <View style={styles.carouselMeta}>
        <Text style={[styles.carouselTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.carouselSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Minimal List Card ────────────────────────────────────────────────────────

function FeedRow({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={styles.feedRow}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <View style={[styles.feedCoverWrap, { borderColor: theme.border }]}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.feedCover}
          contentFit="cover"
        />
      </View>
      <View style={styles.feedMeta}>
        <Text style={[styles.feedTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.feedType, { color: theme.textTertiary }]}>
          {item.type.toUpperCase()}
        </Text>
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
  const { recalculateStats } = useStatsStore();
  const [refreshing, setRefreshing] = useState(false);

  const allItems = useMemo(
    () => Object.values(itemsMap).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
    [itemsMap]
  );

  const inProgress = useMemo(() => allItems.filter((i) => i.status === 'inprogress'), [allItems]);
  const wantItems = useMemo(() => allItems.filter((i) => i.status === 'want').slice(0, 10), [allItems]);

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
            <Plus size={22} color={theme.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* ── In Progress Carousel ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Reading & Watching
            </Text>
          </View>

          {inProgress.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselRow}
              decelerationRate="fast"
              snapToInterval={SCREEN_W * 0.75 + Spacing.md}
              snapToAlignment="start"
            >
              {inProgress.map((item) => (
                <CarouselCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity
              style={[styles.emptyCard, { borderColor: theme.border }]}
              onPress={() => setSheetVisible(true)}
            >
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Start a book or show
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Up Next (List) ── */}
        {wantItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Up Next
              </Text>
            </View>
            <View style={styles.feedContainer}>
              {wantItems.map((item) => (
                <FeedRow
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
  scroll: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 10, paddingBottom: Spacing.xl,
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

  // Sections
  section: { marginBottom: 40 },
  sectionHeader: {
    paddingHorizontal: Spacing.md, marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 28,
  },

  // Carousel (In Progress)
  carouselRow: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  carouselCard: {
    width: SCREEN_W * 0.75,
  },
  carouselCoverWrap: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#1C1C2E',
    marginBottom: 16,
  },
  carouselCover: { width: '100%', height: '100%' },
  carouselMeta: { paddingHorizontal: 4 },
  carouselTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h2,
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },

  // Empty state
  emptyCard: {
    marginHorizontal: Spacing.md, height: 160,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },

  // Feed (Up Next)
  feedContainer: { paddingHorizontal: Spacing.md },
  feedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 12,
  },
  feedCoverWrap: {
    width: 60, height: 85, borderRadius: 6,
    overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth,
  },
  feedCover: { width: '100%', height: '100%' },
  feedMeta: { flex: 1, gap: 4 },
  feedTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  feedType: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption, letterSpacing: 1 },
});
