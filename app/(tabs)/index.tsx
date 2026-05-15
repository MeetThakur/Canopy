import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { StatsRow } from '../../components/home/StatsRow';
import { ActivityFeed } from '../../components/home/ActivityFeed';
import { CoverCard } from '../../components/media/CoverCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const itemsMap = useLibraryStore((s) => s.items);
  const allItems = React.useMemo(() => {
    return Object.values(itemsMap).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [itemsMap]);
  const { recalculateStats } = useStatsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculateStats();
    setTimeout(() => setRefreshing(false), 800);
  }, [recalculateStats]);

  const inProgress = allItems.filter((i) => i.status === 'inprogress').slice(0, 10);
  const recentlyCompleted = allItems.filter((i) => i.status === 'completed').slice(0, 5);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textTertiary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>Kanopi</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <StatsRow />

        {/* In Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>In Progress</Text>
            {inProgress.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/library')}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAll, { color: theme.textTertiary }]}>All</Text>
                <ChevronRight size={14} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          {inProgress.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
              {inProgress.map((item) => (
                <CoverCard key={item.id} item={item} onPress={() => router.push(`/media/${item.id}`)} />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.emptyInline, { borderColor: theme.border }]}>
              <EmptyState
                title="Nothing in progress"
                description="Start tracking something you're reading, watching, or playing."
                actionLabel="Add Item"
                onAction={() => setSheetVisible(true)}
                style={styles.emptyInlineContent}
              />
            </View>
          )}
        </View>

        {/* Recently Completed */}
        {recentlyCompleted.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Completed</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/library')}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAll, { color: theme.textTertiary }]}>All</Text>
                <ChevronRight size={14} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
              {recentlyCompleted.map((item) => (
                <CoverCard key={item.id} item={item} onPress={() => router.push(`/media/${item.id}`)} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <ActivityFeed />
        </View>
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
    paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: Spacing.md,
  },
  appName: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.display },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  sectionTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.h3 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  cardRow: { paddingHorizontal: Spacing.md, gap: 12 },
  emptyInline: {
    marginHorizontal: Spacing.md, borderRadius: 12, borderWidth: 1,
    minHeight: 120, justifyContent: 'center', overflow: 'hidden',
  },
  emptyInlineContent: { flex: undefined, padding: Spacing.md },
});
