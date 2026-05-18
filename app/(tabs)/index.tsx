import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, Platform
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

// ─── Modern Grid Card ────────────────────────────────────────────────────────

function MinimalGridCard({ item, onPress, style }: { item: MediaItem; onPress: () => void; style?: any }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      onPress={onPress}
      accessibilityLabel={item.title}
      activeOpacity={0.8}
    >
      <View style={[styles.gridCoverWrap, { backgroundColor: theme.surface2 }]}>
        <Image
          source={item.coverUrl ? { uri: item.coverUrl } : undefined}
          style={[styles.gridCover, { borderRadius: BorderRadius.md }]}
          contentFit="cover"
        />
      </View>
      <View style={styles.gridMeta}>
        <Text style={[styles.gridTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.gridSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.subtitle || item.type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Modern Row Card ─────────────────────────────────────────────────────────

function getStatusText(status: string) {
  if (status === 'completed') return 'Completed';
  if (status === 'inprogress') return 'Currently Enjoying';
  return 'Added to Planning';
}

function MinimalRow({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.rowCard,
        { backgroundColor: theme.surface, shadowColor: '#000' }
      ]}
      onPress={onPress}
      accessibilityLabel={item.title}
      activeOpacity={0.8}
    >
      <View style={[styles.coverWrap, { backgroundColor: theme.surface2 }]}>
        <Image
          source={item.coverUrl ? { uri: item.coverUrl } : undefined}
          style={[styles.cover, { borderRadius: BorderRadius.sm }]}
          contentFit="cover"
        />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.actionText, { color: theme.accentBooks }]} numberOfLines={1}>
          • {getStatusText(item.status)}
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
  const recentlyAdded = useMemo(() => allItems.filter((i) => i.status !== 'inprogress').slice(0, 10), [allItems]);

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
          <Text style={[styles.logo, { color: theme.textPrimary }]}>kanopi.</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.surface2 }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={20} color={theme.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── In Progress Carousel ── */}
        <View style={styles.carouselSection}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary, paddingHorizontal: Spacing.md }]}>Currently Enjoying</Text>
          
          {inProgress.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.carouselContainer}
              snapToInterval={140 + Spacing.md}
              decelerationRate="fast"
            >
              {inProgress.map((item) => (
                <MinimalGridCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                  style={styles.carouselItem}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={{ paddingHorizontal: Spacing.md }}>
              <TouchableOpacity
                style={[styles.emptyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setSheetVisible(true)}
              >
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Start something new
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Recently Added List ── */}
        {recentlyAdded.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Recently Updated</Text>
            <View style={styles.listContainer}>
              {recentlyAdded.map((item) => (
                <MinimalRow
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

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 20, paddingBottom: 40,
  },
  logo: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 28,
    letterSpacing: -1,
  },
  addBtn: {
    padding: 10,
    borderRadius: BorderRadius.full,
  },

  carouselSection: { marginBottom: 40 },
  listSection: { paddingHorizontal: Spacing.md },
  sectionHeading: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
    marginBottom: 20,
    opacity: 0.8,
    letterSpacing: 0.5,
  },

  carouselContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  carouselItem: {
    width: 140,
  },
  gridCard: {
    width: '100%',
  },
  gridCoverWrap: {
    width: '100%',
    height: 210,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  gridCover: { width: '100%', height: '100%' },
  gridMeta: { gap: 4, paddingHorizontal: 4 },
  gridTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  gridSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
  },

  listContainer: {
    gap: Spacing.md,
  },
  rowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 12,
    borderRadius: BorderRadius.md,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  coverWrap: {
    width: 56, height: 84, borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: '100%' },
  meta: { flex: 1, gap: 6, justifyContent: 'center' },
  title: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  actionText: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.caption,
  },

  emptyCard: {
    width: '100%', paddingVertical: 40,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
});
