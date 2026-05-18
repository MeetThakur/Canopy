import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search as SearchIcon, X, TrendingUp, Sparkles } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { useSearchStore } from "../../stores/searchStore";
import { useLibraryStore } from "../../stores/libraryStore";
import { MediaSearchResult } from "../../types/api";
import { CategoryBadge } from "../../components/media/CategoryBadge";
import { MediaType } from "../../types/media";

const CATEGORY_CHIPS: { label: string; value: "all" | MediaType }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Movies", value: "movie" },
  { label: "TV", value: "tv" },
  { label: "Games", value: "game" },
];

const TRENDING_SEARCHES = [
  "Dune", "Breaking Bad", "Elden Ring", "The Batman", "Oppenheimer", "The Last of Us"
];

function ResultRow({
  item,
  onPress,
}: {
  item: MediaSearchResult;
  onPress?: () => void;
}) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
      style={[styles.resultRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
      accessibilityLabel={item.title}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={styles.resultCover}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.resultSub, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.subtitle || (item.type === 'movie' ? 'Movie' : item.type === 'tv' ? 'TV Show' : item.type === 'game' ? 'Game' : 'Book')}
        </Text>
        <View style={styles.resultMeta}>
          <CategoryBadge type={item.type as MediaType} />
          {item.year && (
            <Text style={[styles.resultYear, { color: theme.textTertiary }]}>{item.year}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const {
    query,
    category,
    results,
    recentSearches,
    loading,
    setQuery,
    setCategory,
    search,
    clearRecentSearches,
  } = useSearchStore();
  const itemsMap = useLibraryStore((s) => s.items);
  const libraryItems = React.useMemo(() => {
    return Object.values(itemsMap).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [itemsMap]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (text.trim().length > 1) {
        debounceRef.current = setTimeout(() => search(), 300);
      }
    },
    [setQuery, search],
  );

  const handleClear = () => {
    setQuery("");
  };

  const libraryMatches =
    query.length > 1
      ? libraryItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
      : [];

  const webResults = results.filter(
    (r) => !libraryItems.find((l) => l.sourceId === r.sourceId),
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SearchIcon size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="Search books, movies, games…"
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            onSubmitEditing={() => { search(); Keyboard.dismiss(); }}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <X size={16} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <View style={{ flexGrow: 0, paddingBottom: Spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {CATEGORY_CHIPS.map((chip) => {
            const active = category === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                onPress={() => setCategory(chip.value)}
                style={[styles.chip, { backgroundColor: active ? theme.textPrimary : theme.surface2 }]}
              >
                <Text style={[styles.chipText, { color: active ? theme.background : theme.textSecondary }]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {loading && (
          <ActivityIndicator color={theme.textSecondary} style={{ marginTop: Spacing.xl }} />
        )}

        {/* Empty State: Discover */}
        {!loading && query.length === 0 && (
          <View style={styles.discoverSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={theme.accentBooks} />
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Trending Searches</Text>
            </View>
            <View style={styles.trendingGrid}>
              {TRENDING_SEARCHES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.trendingTag, { backgroundColor: theme.surface2 }]}
                  onPress={() => { setQuery(t); search(); }}
                >
                  <Text style={[styles.trendingTagText, { color: theme.textSecondary }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {recentSearches.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                  <Sparkles size={16} color={theme.textTertiary} />
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Recent</Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={[styles.clearText, { color: theme.destructive }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.recentRow, { borderBottomColor: theme.border }]}
                    onPress={() => { setQuery(r); search(); }}
                  >
                    <SearchIcon size={14} color={theme.textTertiary} />
                    <Text style={[styles.recentText, { color: theme.textPrimary }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {/* Results */}
        {!loading && libraryMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>
              In Your Library
            </Text>
            <View style={{ gap: Spacing.sm }}>
              {libraryMatches.map((item) => (
                <ResultRow
                  key={item.id}
                  item={{
                    id: item.id,
                    sourceId: item.sourceId,
                    type: item.type,
                    title: item.title,
                    subtitle: item.subtitle,
                    coverUrl: item.coverUrl,
                    year: item.year,
                  }}
                  onPress={() => router.push(`/media/${item.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {!loading && webResults.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>
              From the Web
            </Text>
            <View style={{ gap: Spacing.sm }}>
              {webResults.map((item) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  onPress={() => {
                    router.push({
                      pathname: "/media/preview",
                      params: {
                        itemData: JSON.stringify(item),
                      },
                    });
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {!loading && query.length > 1 && results.length === 0 && libraryMatches.length === 0 && (
          <View style={styles.noResultsContainer}>
            <SearchIcon size={48} color={theme.surface2} />
            <Text style={[styles.noResults, { color: theme.textTertiary }]}>No results found for "{query}"</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: Spacing.md, paddingTop: 12 },
  headerTitle: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 28, letterSpacing: -1 },
  searchWrap: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: 14, height: 48, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
  chipsRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full },
  chipText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  scroll: { paddingBottom: 80 },
  discoverSection: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: "uppercase", letterSpacing: 1 },
  clearText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  trendingGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  trendingTag: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.sm },
  trendingTagText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  recentRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  recentText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
  resultRow: {
    flexDirection: "row", padding: Spacing.sm, borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth, gap: Spacing.md, alignItems: "center"
  },
  resultCover: { width: 56, height: 80, borderRadius: BorderRadius.sm, backgroundColor: "#2E2C2A" },
  resultInfo: { flex: 1, gap: 4, justifyContent: "center" },
  resultTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  resultSub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: 4 },
  resultYear: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption },
  noResultsContainer: { alignItems: "center", marginTop: Spacing.xxl, gap: Spacing.md },
  noResults: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
});
