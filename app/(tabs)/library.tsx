import React, { useState, useMemo, useCallback } from "react";
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
import { LayoutGrid, List, Plus, GripVertical } from "lucide-react-native";
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
import { DraggableList } from "../../components/media/DraggableList";
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
  { label: "Films", value: "movie" },
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
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} accessibilityLabel={item.title}>
      <View style={styles.gridCoverContainer}>
        <Image source={{ uri: item.coverUrl || undefined }} style={styles.gridCover} contentFit="cover" transition={200} />
        <View style={styles.gridIconOverlay}>
          <CategoryBadge type={item.type} size={14} />
        </View>
      </View>
      <Text style={[styles.gridTitle, { color: theme.textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const itemsMap = useLibraryStore((s) => s.items);
  const order = useLibraryStore((s) => s.order);
  const reorderItems = useLibraryStore((s) => s.reorderItems);

  // Build ordered list from persisted order
  const orderedItems = useMemo(() => {
    const listed: MediaItem[] = [];
    const seen = new Set<string>();
    for (const id of order) {
      if (itemsMap[id]) { listed.push(itemsMap[id]); seen.add(id); }
    }
    for (const item of Object.values(itemsMap)) {
      if (!seen.has(item.id)) listed.push(item);
    }
    return listed;
  }, [itemsMap, order]);

  const [activeCategory, setActiveCategory] = useState<"all" | MediaType>("all");
  const [activeStatus, setActiveStatus] = useState<"all" | Status>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [reorderMode, setReorderMode] = useState(false);

  const isFiltered = activeCategory !== "all" || activeStatus !== "all";

  const filtered = useMemo(
    () => orderedItems.filter((item) => {
      if (activeCategory !== "all" && item.type !== activeCategory) return false;
      if (activeStatus !== "all" && item.status !== activeStatus) return false;
      return true;
    }),
    [orderedItems, activeCategory, activeStatus]
  );

  const toggleView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode((v) => (v === "list" ? "grid" : "list"));
    if (reorderMode) setReorderMode(false);
  };

  // Called by DraggableList when user finishes drag — rebuild full order
  const handleReorder = useCallback(
    (newFilteredData: MediaItem[]) => {
      const draggedIds = new Set(newFilteredData.map((i) => i.id));
      const newDraggedIds = newFilteredData.map((i) => i.id);
      const currentOrder = [...order];
      // Find the positions in the full order where filtered items sit
      const positions: number[] = [];
      currentOrder.forEach((id, idx) => { if (draggedIds.has(id)) positions.push(idx); });
      // Slot the new order into those positions
      const newFullOrder = [...currentOrder];
      positions.forEach((pos, i) => { newFullOrder[pos] = newDraggedIds[i]; });
      reorderItems(newFullOrder);
    },
    [order, reorderItems]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>My Library</Text>
          <Text style={[styles.itemCount, { color: theme.textTertiary }]}>
            {orderedItems.length} {orderedItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {viewMode === "list" && !isFiltered && (
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setReorderMode((r) => !r);
              }}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: reorderMode ? theme.accent + "20" : theme.surface2,
                  borderWidth: 1,
                  borderColor: reorderMode ? theme.accent : "transparent",
                },
              ]}
              accessibilityLabel="Toggle reorder mode"
            >
              <GripVertical size={18} color={reorderMode ? theme.accent : theme.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={toggleView}
            style={[styles.iconBtn, { backgroundColor: theme.surface2 }]}
            accessibilityLabel="Toggle view mode"
          >
            {viewMode === "list" ? (
              <LayoutGrid size={18} color={theme.textPrimary} />
            ) : (
              <List size={18} color={theme.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category tabs */}
      <View style={{ flexGrow: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => { setActiveCategory(tab.value); if (reorderMode) setReorderMode(false); }}
                style={[styles.tab, { borderBottomColor: active ? theme.accent : "transparent", borderBottomWidth: 2 }]}
                accessibilityLabel={`Filter by ${tab.label}`}
              >
                <Text style={[styles.tabText, { color: active ? theme.accent : theme.textTertiary, fontFamily: active ? Typography.fontFamily.primarySemiBold : Typography.fontFamily.primary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status pills */}
      <View style={{ flexGrow: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {STATUS_FILTERS.map((f) => {
            const active = activeStatus === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => { setActiveStatus(f.value); if (reorderMode) setReorderMode(false); }}
                style={[styles.pill, { backgroundColor: active ? theme.textPrimary : theme.surface2 }]}
                accessibilityLabel={`Filter by ${f.label}`}
              >
                <Text style={[styles.pillText, { color: active ? theme.background : theme.textSecondary }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Reorder hint */}
      {reorderMode && (
        <View style={[styles.reorderHint, { backgroundColor: theme.accent + "12" }]}>
          <Text style={[styles.reorderHintText, { color: theme.accent }]}>
            Drag the handle to reorder items
          </Text>
        </View>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Start building your library." actionLabel="Add Item" onAction={() => setSheetVisible(true)} />
      ) : viewMode === "list" && reorderMode ? (
        <DraggableList
          data={filtered}
          onReorder={handleReorder}
          onPress={(item) => router.push(`/media/${item.id}`)}
        />
      ) : viewMode === "list" ? (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MediaRow item={item} onPress={() => router.push(`/media/${item.id}`)} style={{ paddingHorizontal: Spacing.md }} />
          )}
          estimatedItemSize={88}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={{ flex: 1, padding: Spacing.xs }}>
              <GridCard item={item} onPress={() => router.push(`/media/${item.id}`)} />
            </View>
          )}
          estimatedItemSize={160}
          contentContainerStyle={{ paddingHorizontal: Spacing.sm, paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => setSheetVisible(true)}
        accessibilityLabel="Add new media item"
      >
        <Plus size={22} color="#FFF" />
      </TouchableOpacity>

      <AddMediaSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: Spacing.sm,
  },
  pageTitle: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.display },
  itemCount: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  tabsRow: { paddingHorizontal: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xs },
  tab: { paddingVertical: Spacing.sm },
  tabText: { fontSize: Typography.sizes.body },
  pillRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: Spacing.sm },
  pill: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  reorderHint: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.xs,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.sm,
  },
  reorderHintText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  gridCard: { marginBottom: Spacing.sm },
  gridCoverContainer: {
    height: 150, width: "100%", borderRadius: BorderRadius.md,
    overflow: "hidden", backgroundColor: "#2E2C2A", marginBottom: Spacing.xs,
  },
  gridCover: { width: "100%", height: "100%" },
  gridIconOverlay: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: BorderRadius.sm, padding: 4,
  },
  gridTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: 12 },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 48, height: 48, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
});
