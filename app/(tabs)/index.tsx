import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, Plus } from "lucide-react-native";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { StatsRow } from "../../components/home/StatsRow";
import { ActivityFeed } from "../../components/home/ActivityFeed";
import { CoverCard } from "../../components/media/CoverCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { AddMediaSheet } from "../../components/sheets/AddMediaSheet";
import { useLibraryStore } from "../../stores/libraryStore";
import { useStatsStore } from "../../stores/statsStore";

export default function HomeScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const itemsMap = useLibraryStore((s) => s.items);
  const allItems = React.useMemo(() => {
    return Object.values(itemsMap).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [itemsMap]);
  const { recalculateStats } = useStatsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculateStats();
    setTimeout(() => setRefreshing(false), 800);
  }, [recalculateStats]);

  const inProgress = allItems
    .filter((i) => i.status === "inprogress")
    .slice(0, 10);
  const recentlyCompleted = allItems
    .filter((i) => i.status === "completed")
    .slice(0, 5);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.appName, { color: theme.textPrimary }]}>
              Kanopi
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.surface2 }]}
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: theme.accentBooks }]}
              onPress={() => router.push("/(tabs)/profile")}
              accessibilityLabel="Profile"
            >
              <Text style={styles.avatarText}>YO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <Text
          style={[
            styles.sectionLabel,
            { color: theme.textSecondary, paddingHorizontal: Spacing.md },
          ]}
        >
          Your Library
        </Text>
        <StatsRow />

        {/* In Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              In Progress
            </Text>
            {inProgress.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/(tabs)/library")}>
                <Text style={[styles.seeAll, { color: theme.accentMovies }]}>
                  See all
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {inProgress.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardRow}
            >
              {inProgress.map((item) => (
                <CoverCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.emptyInline,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <EmptyState
                title="Nothing in progress"
                description="Start something you're currently reading, watching, or playing."
                actionLabel="+ Add Item"
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
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Recently Completed
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/library")}>
                <Text style={[styles.seeAll, { color: theme.accentMovies }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardRow}
            >
              {recentlyCompleted.map((item) => (
                <CoverCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <ActivityFeed />
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.textPrimary }]}
        onPress={() => setSheetVisible(true)}
        accessibilityLabel="Add new media item"
      >
        <Plus size={24} color={theme.background} />
      </TouchableOpacity>

      <AddMediaSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerLeft: { gap: 2 },
  greeting: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },
  appName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.display,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.bodySmall,
    color: "#FFF",
  },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h3,
  },
  seeAll: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  cardRow: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  cardItem: {},
  emptyInline: {
    marginHorizontal: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 140,
    justifyContent: "center",
    overflow: "hidden",
  },
  emptyInlineContent: { flex: undefined, padding: Spacing.lg },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
