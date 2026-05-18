import React, { useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search as SearchIcon, X, TrendingUp, Clock, BookOpen, Film, Tv, Gamepad2, Layers } from "lucide-react-native";
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

const CATEGORY_CHIPS: { label: string; value: "all" | MediaType; Icon: any }[] = [
  { label: "All",    value: "all",   Icon: Layers },
  { label: "Books",  value: "book",  Icon: BookOpen },
  { label: "Movies", value: "movie", Icon: Film },
  { label: "TV",     value: "tv",    Icon: Tv },
  { label: "Games",  value: "game",  Icon: Gamepad2 },
];

const TRENDING_SEARCHES = [
  "Dune", "Breaking Bad", "Elden Ring", "Oppenheimer",
  "The Last of Us", "Inception", "Dark", "Hollow Knight",
];

function ResultCard({ item, onPress }: { item: MediaSearchResult; onPress?: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={styles.resultCover}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: theme.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.subtitle && (
          <Text style={[styles.resultSub, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
        <View style={styles.resultMeta}>
          <CategoryBadge type={item.type as MediaType} />
          {item.year && <Text style={[styles.resultYear, { color: theme.textTertiary }]}>{item.year}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const { query, category, results, recentSearches, loading, setQuery, setCategory, search, clearRecentSearches } = useSearchStore();
  const itemsMap = useLibraryStore((s) => s.items);
  const libraryItems = React.useMemo(() =>
    Object.values(itemsMap).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  [itemsMap]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResults = useCallback(() => {
    // Directly clear results in the store when query is emptied
    useSearchStore.setState({ results: [] });
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length > 1) {
      debounceRef.current = setTimeout(() => search(), 350);
    } else if (text.trim().length === 0) {
      clearResults();
    }
  }, [setQuery, search, clearResults]);

  // Auto-search when category changes (if there's already a query)
  useEffect(() => {
    if (query.trim().length > 1) {
      search();
    }
  }, [category]);

  const libraryMatches = query.length > 1
    ? libraryItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const webResults = results.filter((r) => !libraryItems.find((l) => l.sourceId === r.sourceId));
  const hasResults = libraryMatches.length > 0 || webResults.length > 0;
  const noResults = !loading && query.length > 1 && !hasResults;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>

      {/* ── Header ──────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerEyebrow, { color: theme.textTertiary }]}>Discover</Text>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Explore</Text>
        </View>
      </View>

      {/* ── Search bar ──────────────────── */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SearchIcon size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="Search books, movies, shows, games…"
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            onSubmitEditing={() => { search(); Keyboard.dismiss(); }}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); clearResults(); }} hitSlop={8}>
              <X size={16} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips ──────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} style={styles.chipsScroll}>
        {CATEGORY_CHIPS.map((chip) => {
          const active = category === chip.value;
          const ChipIcon = chip.Icon;
          return (
            <TouchableOpacity
              key={chip.value}
              onPress={() => setCategory(chip.value)}
              style={[styles.chip, active ? { backgroundColor: theme.textPrimary } : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth }]}
            >
              <ChipIcon size={13} color={active ? theme.background : theme.textTertiary} />
              <Text style={[styles.chipText, { color: active ? theme.background : theme.textSecondary }]}>{chip.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Loading */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.accentBooks} size="small" />
            <Text style={[styles.loadingText, { color: theme.textTertiary }]}>Searching…</Text>
          </View>
        )}

        {/* ── Empty / Discover state ──────── */}
        {!loading && query.length === 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Trending</Text>
            <View style={styles.trendingGrid}>
              {TRENDING_SEARCHES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.trendChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => { setQuery(t); search(); }}
                >
                  <TrendingUp size={12} color={theme.accentBooks} />
                  <Text style={[styles.trendChipText, { color: theme.textSecondary }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {recentSearches.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Recent</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={[styles.clearBtn, { color: theme.destructive }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((r) => (
                  <TouchableOpacity key={r} style={[styles.recentRow, { borderBottomColor: theme.border }]} onPress={() => { setQuery(r); search(); }}>
                    <Clock size={14} color={theme.textTertiary} />
                    <Text style={[styles.recentText, { color: theme.textPrimary }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        {/* ── Library matches ─────────────── */}
        {!loading && libraryMatches.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>In Your Library</Text>
            {libraryMatches.map((item) => (
              <ResultCard
                key={item.id}
                item={{ id: item.id, sourceId: item.sourceId, type: item.type, title: item.title, subtitle: item.subtitle, coverUrl: item.coverUrl, year: item.year }}
                onPress={() => router.push(`/media/${item.id}`)}
              />
            ))}
          </>
        )}

        {/* ── Web results ─────────────────── */}
        {!loading && webResults.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>From the Web</Text>
            {webResults.map((item) => (
              <ResultCard
                key={item.id}
                item={item}
                onPress={() => router.push({ pathname: "/media/preview", params: { itemData: JSON.stringify(item) } })}
              />
            ))}
          </>
        )}

        {/* ── No results ─────────────────── */}
        {noResults && (
          <View style={styles.emptyState}>
            <SearchIcon size={40} color={theme.surface2} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No results for "{query}"</Text>
            <Text style={[styles.emptyHint, { color: theme.textTertiary }]}>Try a different spelling or category</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, marginBottom: Spacing.sm },
  headerEyebrow: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption, marginBottom: 2 },
  headerTitle: { fontFamily: Typography.fontFamily.primaryBold, fontSize: 30, letterSpacing: -1 },
  searchWrap: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingHorizontal: 14, height: 48, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
  chipsScroll: { flexGrow: 0, marginBottom: Spacing.md },
  chipsRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingRight: Spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full },
  chipText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  centered: { alignItems: "center", gap: 8, paddingTop: Spacing.xxl },
  loadingText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
  sectionLabel: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: "uppercase", letterSpacing: 1, marginTop: Spacing.md, marginBottom: Spacing.sm },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  clearBtn: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  trendingGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.sm },
  trendChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.sm, borderWidth: StyleSheet.hairlineWidth },
  trendChipText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  recentRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  recentText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
  resultCard: {
    flexDirection: "row", borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden", marginBottom: Spacing.sm,
  },
  resultCover: { width: 72, height: 104 },
  resultInfo: { flex: 1, padding: 12, gap: 4, justifyContent: "center" },
  resultTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body, lineHeight: 20 },
  resultSub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: 4 },
  resultYear: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption },
  emptyState: { alignItems: "center", paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  emptyHint: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
});
