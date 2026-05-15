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
      <View style={[styles.gridCoverContainer, { borderColor: theme.border, borderWidth: 1 }]}>
        <Image source={{ uri: item.coverUrl || undefined }} style={styles.gridCover} contentFit="cover" transition={200} />
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
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Huge Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.pageTitleHuge, { color: theme.textPrimary }]}>
            My Library
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleView}
          style={[styles.iconBtn, { borderColor: theme.border, borderWidth: 1 }]}
          accessibilityLabel="Toggle view mode"
        >
          {viewMode === "list" ? (
            <LayoutGrid size={20} color={theme.textPrimary} />
          ) : (
            <List size={20} color={theme.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <View style={{ flexShrink: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveCategory(tab.value)}
                style={[
                  styles.pillOutline,
                  { 
                    borderColor: active ? theme.textPrimary : theme.border,
                    backgroundColor: active ? theme.textPrimary : 'transparent'
                  }
                ]}
                accessibilityLabel={`Filter by ${tab.label}`}
              >
                <Text style={[
                  styles.pillOutlineText,
                  { color: active ? theme.background : theme.textSecondary }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status pills */}
      <View style={{ flexShrink: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {STATUS_FILTERS.map((f) => {
            const active = activeStatus === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActiveStatus(f.value)}
                style={[
                  styles.pillOutline,
                  { 
                    borderColor: active ? theme.textPrimary : theme.border,
                    backgroundColor: active ? theme.textPrimary : 'transparent'
                  }
                ]}
                accessibilityLabel={`Filter by ${f.label}`}
              >
                <Text style={[
                  styles.pillOutlineText,
                  { color: active ? theme.background : theme.textSecondary }
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content - wrapped in flex: 1 to prevent layout collapse */}
      <View style={{ flex: 1, marginTop: Spacing.sm }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Start building your collection."
            actionLabel="Add Item"
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
            contentContainerStyle={{ paddingBottom: 100 }}
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
            contentContainerStyle={{ paddingHorizontal: Spacing.sm, paddingBottom: 100 }}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.textPrimary }]}
        onPress={() => setSheetVisible(true)}
        accessibilityLabel="Add new media item"
      >
        <Plus size={24} color={theme.background} />
      </TouchableOpacity>

      <AddMediaSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: Spacing.md, paddingTop: 16, paddingBottom: Spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  countHuge: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 54,
    lineHeight: 56,
  },
  pageTitleHuge: { 
    fontFamily: Typography.fontFamily.heading, 
    fontSize: 42,
    lineHeight: 46,
  },
  iconBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    justifyContent: "center", alignItems: "center" 
  },
  tabsRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xs },
  pillRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  pillOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  pillOutlineText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  gridCard: { marginBottom: Spacing.sm },
  gridCoverContainer: {
    height: 150, width: "100%", borderRadius: BorderRadius.md,
    overflow: "hidden", backgroundColor: "transparent", marginBottom: Spacing.xs,
  },
  gridCover: { width: "100%", height: "100%" },
  gridTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: 12 },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
