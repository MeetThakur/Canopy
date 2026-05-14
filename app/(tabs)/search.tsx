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
import { Search as SearchIcon, X } from "lucide-react-native";
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
import { AddMediaSheet } from "../../components/sheets/AddMediaSheet";

const CATEGORY_CHIPS: { label: string; value: "all" | MediaType }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Movies", value: "movie" },
  { label: "TV", value: "tv" },
  { label: "Games", value: "game" },
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
      style={[styles.resultRow, { borderBottomColor: theme.border }]}
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
        <Text
          style={[styles.resultTitle, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.resultSub, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.subtitle}
        </Text>
        <View style={styles.resultMeta}>
          <CategoryBadge type={item.type as MediaType} />
          {item.year && (
            <Text style={[styles.resultYear, { color: theme.textTertiary }]}>
              {item.year}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
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
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
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
      ? libraryItems.filter((i) =>
          i.title.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const webResults = results.filter(
    (r) => !libraryItems.find((l) => l.sourceId === r.sourceId),
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <SearchIcon size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="Search books, movies, games…"
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            onSubmitEditing={() => {
              search();
              Keyboard.dismiss();
            }}
            autoCapitalize="none"
            accessibilityLabel="Search input"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              accessibilityLabel="Clear search"
            >
              <X size={16} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <View style={{ flexGrow: 0, paddingBottom: Spacing.sm }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORY_CHIPS.map((chip) => {
            const active = category === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                onPress={() => setCategory(chip.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? theme.textPrimary
                      : theme.surface2,
                  },
                ]}
                accessibilityLabel={`Filter by ${chip.label}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? theme.background : theme.textSecondary },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <ActivityIndicator
            color={theme.textSecondary}
            style={{ marginTop: Spacing.xl }}
          />
        )}

        {!loading && query.length === 0 && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                Recent Searches
              </Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={[styles.clearText, { color: theme.destructive }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.recentRow, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setQuery(r);
                  search();
                }}
                accessibilityLabel={`Recent search: ${r}`}
              >
                <Text style={[styles.recentText, { color: theme.textPrimary }]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!loading && libraryMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              In Your Library
            </Text>
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
        )}

        {!loading && webResults.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              From the Web
            </Text>
            {webResults.map((item) => (
              <ResultRow
                key={item.id}
                item={item}
                onPress={() => {
                  router.push({
                    pathname: "/media/preview",
                    params: {
                      id: item.id,
                      sourceId: item.sourceId || "",
                      type: item.type,
                      title: item.title,
                      subtitle: item.subtitle || "",
                      coverUrl: item.coverUrl || "",
                      year: item.year || "",
                    },
                  });
                }}
              />
            ))}
          </View>
        )}

        {!loading &&
          query.length > 1 &&
          results.length === 0 &&
          libraryMatches.length === 0 && (
            <Text style={[styles.noResults, { color: theme.textTertiary }]}>
              No results found for "{query}"
            </Text>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },
  chipsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  scroll: { paddingBottom: 80 },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  clearText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  recentRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },
  resultRow: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  resultCover: {
    width: 48,
    height: 68,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#2E2C2A",
  },
  resultInfo: { flex: 1, gap: 4, justifyContent: "center" },
  resultTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  resultSub: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resultYear: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
  },
  noResults: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },
});
