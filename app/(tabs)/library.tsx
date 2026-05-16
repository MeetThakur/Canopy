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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { LayoutGrid, List, Plus, Search, ArrowDownAZ } from "lucide-react-native";
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

type SortMode = 'newest' | 'alphabetical' | 'rating';

function GridCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} accessibilityLabel={item.title}>
      <View style={[styles.gridCoverContainer, { borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth }]}>
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

  const [activeCategory, setActiveCategory] = useState<"all" | MediaType>("all");
  const [activeStatus, setActiveStatus] = useState<"all" | Status>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const filteredAndSorted = useMemo(() => {
    let result = Object.values(itemsMap);

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (activeCategory !== "all") {
      result = result.filter(item => item.type === activeCategory);
    }

    // Filter by Status
    if (activeStatus !== "all") {
      result = result.filter(item => item.status === activeStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortMode === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortMode === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortMode === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return result;
  }, [itemsMap, activeCategory, activeStatus, searchQuery, sortMode]);

  const toggleView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode((v) => (v === "list" ? "grid" : "list"));
  };

  const cycleSortMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const modes: SortMode[] = ['newest', 'alphabetical', 'rating'];
    const nextIndex = (modes.indexOf(sortMode) + 1) % modes.length;
    setSortMode(modes[nextIndex]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Calm Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitleCalm, { color: theme.textPrimary }]}>
          library.
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={cycleSortMode} style={styles.iconBtn}>
            <ArrowDownAZ size={20} color={theme.textPrimary} />
            <Text style={[styles.sortLabel, { color: theme.textSecondary }]}>
              {sortMode === 'newest' ? 'New' : sortMode === 'alphabetical' ? 'A-Z' : 'Best'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleView} style={styles.iconBtn}>
            {viewMode === "list" ? (
              <LayoutGrid size={20} color={theme.textPrimary} />
            ) : (
              <List size={20} color={theme.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Search size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search your collection..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
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

      {/* Content */}
      <View style={{ flex: 1, marginTop: Spacing.sm }}>
        {filteredAndSorted.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No results found" : "Nothing here yet"}
            description={searchQuery ? "Try a different search term." : "Start building your collection."}
            actionLabel={searchQuery ? "Clear Search" : "Add Item"}
            onAction={() => searchQuery ? setSearchQuery('') : setSheetVisible(true)}
          />
        ) : viewMode === "list" ? (
          <FlashList
            data={filteredAndSorted}
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
            data={filteredAndSorted}
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
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingTop: 16, paddingBottom: 10,
  },
  pageTitleCalm: { 
    fontFamily: Typography.fontFamily.primaryBold, 
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBtn: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 4,
  },
  sortLabel: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.caption,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    height: '100%',
  },
  tabsRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  pillRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  pillOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillOutlineText: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.bodySmall,
  },
  gridCard: { marginBottom: Spacing.sm },
  gridCoverContainer: {
    height: 140, width: "100%", borderRadius: 6,
    overflow: "hidden", backgroundColor: "transparent", marginBottom: Spacing.xs,
  },
  gridCover: { width: "100%", height: "100%" },
  gridTitle: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: 12 },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
