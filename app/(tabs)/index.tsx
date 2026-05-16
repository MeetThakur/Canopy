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

// ─── Calm Minimal Row ────────────────────────────────────────────────────────

function MinimalRow({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.minimalRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <View style={[styles.coverWrap, { borderColor: theme.border }]}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.cover}
          contentFit="cover"
        />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.subtitle || item.type.toUpperCase()}
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
        {/* ── Calm Header ── */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.textPrimary }]}>kanopi.</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={24} color={theme.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* ── In Progress List ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Currently Enjoying</Text>
          
          {inProgress.length > 0 ? (
            <View style={styles.listContainer}>
              {inProgress.map((item) => (
                <MinimalRow
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.emptyCard, { borderColor: theme.border }]}
              onPress={() => setSheetVisible(true)}
            >
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Start something new
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Recently Added ── */}
        {recentlyAdded.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Recently Added</Text>
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 20, paddingBottom: 40,
  },
  logo: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  addBtn: {
    padding: Spacing.xs,
  },

  // Sections
  section: { marginBottom: 40, paddingHorizontal: Spacing.md },
  sectionHeading: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.body,
    marginBottom: 20,
    opacity: 0.6,
  },

  // List
  listContainer: {
    gap: Spacing.xs,
  },
  minimalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  coverWrap: {
    width: 48, height: 72, borderRadius: 4,
    overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth,
  },
  cover: { width: '100%', height: '100%' },
  meta: { flex: 1, gap: 4, justifyContent: 'center' },
  title: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.body,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },

  // Empty state
  emptyCard: {
    width: '100%', paddingVertical: 40,
    borderRadius: BorderRadius.md, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
});
