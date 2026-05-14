import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { LayoutGrid, List, Plus } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { useLibraryStore } from "../../stores/libraryStore";
import { MediaRow } from "../../components/media/MediaRow";
import { EmptyState } from "../../components/ui/EmptyState";
import { CategoryBadge } from "../../components/media/CategoryBadge";
import { AddMediaSheet } from "../../components/sheets/AddMediaSheet";
import { MediaType, Status, MediaItem } from "../../types/media";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_TABS: { label: string; value: "all" | MediaType }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Movies", value: "movie" },
  { label: "TV", value: "tv" },
  { label: "Games", value: "game" },
];

const STATUS_FILTERS: { label: string; value: "all" | Status }[] = [
  { label: "All", value: "all" },
  { label: "Want", value: "want" },
  { label: "In Progress", value: "inprogress" },
  { label: "Completed", value: "completed" },
];

function GridCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={styles.gridCover}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.gridOverlay}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <CategoryBadge type={item.type} />
      </View>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const itemsMap = useLibraryStore((s) => s.items);
  const allItems = useMemo(() => {
    return Object.values(itemsMap).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [itemsMap]);

  const [activeCategory, setActiveCategory] = useState<"all" | MediaType>(
    "all",
  );
  const [activeStatus, setActiveStatus] = useState<"all" | Status>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = useMemo(
    () =>
      allItems.filter((item) => {
        if (activeCategory !== "all" && item.type !== activeCategory)
          return false;
        if (activeStatus !== "all" && item.status !== activeStatus)
          return false;
        return true;
      }),
    [allItems, activeCategory, activeStatus],
  );

  const toggleView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode((v) => (v === "list" ? "grid" : "list"));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>
            My Library
          </Text>
          <Text style={[styles.itemCount, { color: theme.textTertiary }]}>
            {allItems.length} {allItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleView}
          style={[styles.iconBtn, { backgroundColor: theme.surface2 }]}
          accessibilityLabel="Toggle view mode"
        >
          {viewMode === "list" ? (
            <LayoutGrid size={20} color={theme.textPrimary} />
          ) : (
            <List size={20} color={theme.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ flexGrow: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveCategory(tab.value)}
                style={[
                  styles.tab,
                  {
                    borderBottomColor: active
                      ? theme.textPrimary
                      : "transparent",
                    borderBottomWidth: 2,
                  },
                ]}
                accessibilityLabel={`Filter by ${tab.label}`}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: active ? theme.textPrimary : theme.textTertiary,
                      fontFamily: active
                        ? Typography.fontFamily.primarySemiBold
                        : Typography.fontFamily.primary,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flexGrow: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {STATUS_FILTERS.map((f) => {
            const active = activeStatus === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActiveStatus(f.value)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active
                      ? theme.textPrimary
                      : theme.surface2,
                  },
                ]}
                accessibilityLabel={`Filter by ${f.label}`}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: active ? theme.background : theme.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Start building your library."
          actionLabel="+ Add Item"
          onAction={() => setSheetVisible(true)}
        />
      ) : viewMode === "list" ? (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MediaRow
              item={item}
              onPress={() => router.push(`/media/${item.id}`)}
              style={{ paddingHorizontal: Spacing.md }}
            />
          )}
          estimatedItemSize={88}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={{ flex: 1, padding: Spacing.xs }}>
              <GridCard
                item={item}
                onPress={() => router.push(`/media/${item.id}`)}
              />
            </View>
          )}
          estimatedItemSize={200}
          contentContainerStyle={{
            paddingHorizontal: Spacing.sm,
            paddingBottom: 80,
          }}
        />
      )}

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.display,
  },
  itemCount: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
    marginTop: 2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  tab: { paddingVertical: Spacing.sm },
  tabText: { fontSize: Typography.sizes.body },
  pillRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  gridCard: {
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: "#2E2C2A",
  },
  gridCover: { width: "100%", height: "100%" },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  gridTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
    color: "#FFF",
  },
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
