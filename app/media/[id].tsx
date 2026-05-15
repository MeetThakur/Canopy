import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft, Trash2, Star, Calendar, Clock, BookOpen,
  Tv, Gamepad2, Film, Users, Globe, Tag,
} from "lucide-react-native";
import { format } from "date-fns";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { useLibraryStore } from "../../stores/libraryStore";
import { StarRating } from "../../components/ui/StarRating";
import { AddMediaSheet } from "../../components/sheets/AddMediaSheet";
import * as Haptics from "expo-haptics";

const STATUS_OPTIONS = [
  { label: "Want", value: "want" as const },
  { label: "In Progress", value: "inprogress" as const },
  { label: "Completed", value: "completed" as const },
];

// ─── Reusable sub-components ────────────────────────────────────────────────

function MetaChip({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[chipStyles.chip, { backgroundColor: theme.surface2 }]}>
      <Text style={[chipStyles.label, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[chipStyles.value, { color: accent ?? theme.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: { borderRadius: BorderRadius.sm, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, marginBottom: 8 },
  label: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.micro, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
  value: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
});

function SectionHeader({ title }: { title: string }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <Text style={[secStyles.header, { color: theme.textTertiary }]}>{title}</Text>
  );
}
const secStyles = StyleSheet.create({
  header: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
});

function GenrePills({ genres, accent }: { genres: string[]; accent: string }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {genres.map((g) => (
        <View key={g} style={[{ backgroundColor: accent + "15", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }]}>
          <Text style={{ fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall, color: accent }}>{g}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Type-specific info panels ────────────────────────────────────────────────

function BookInfo({ item }: { item: any }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={styles.infoPanel}>
      <View style={styles.chipRow}>
        {item.pages && <MetaChip label="Pages" value={item.pages} />}
        {item.pagesRead ? <MetaChip label="Read" value={`${item.pagesRead} / ${item.pages ?? "?"}`} accent={theme.accentBooks} /> : null}
        {item.year && <MetaChip label="Year" value={item.year} />}
        {item.language && <MetaChip label="Language" value={item.language.toUpperCase()} />}
        {item.publisher && <MetaChip label="Publisher" value={item.publisher} />}
      </View>
      {item.genre?.length > 0 && (
        <View style={styles.subSection}>
          <SectionHeader title="Genres" />
          <GenrePills genres={item.genre} accent={theme.accentBooks} />
        </View>
      )}
    </View>
  );
}

function MovieInfo({ item }: { item: any }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={styles.infoPanel}>
      <View style={styles.chipRow}>
        {item.runtime && <MetaChip label="Runtime" value={`${item.runtime} min`} />}
        {item.releaseDate && <MetaChip label="Released" value={item.releaseDate} />}
        {item.language && <MetaChip label="Language" value={item.language.toUpperCase()} />}
      </View>
      {item.director && (
        <View style={styles.subSection}>
          <SectionHeader title="Director" />
          <Text style={{ fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body, color: theme.textPrimary }}>{item.director}</Text>
        </View>
      )}
      {item.cast?.length > 0 && (
        <View style={styles.subSection}>
          <SectionHeader title="Cast" />
          <Text style={{ fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, color: theme.textSecondary, lineHeight: 22 }}>
            {item.cast.join(" · ")}
          </Text>
        </View>
      )}
      {item.genre?.length > 0 && (
        <View style={styles.subSection}>
          <SectionHeader title="Genres" />
          <GenrePills genres={item.genre} accent={theme.accentMovies} />
        </View>
      )}
    </View>
  );
}

function TVInfo({ item }: { item: any }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={styles.infoPanel}>
      <View style={styles.chipRow}>
        {item.seasons && <MetaChip label="Seasons" value={item.seasons} />}
        {item.numberOfEpisodes && <MetaChip label="Episodes" value={item.numberOfEpisodes} />}
        {item.episodesWatched ? <MetaChip label="Watched" value={item.episodesWatched} accent={theme.accentTV} /> : null}
        {item.network && <MetaChip label="Network" value={item.network} />}
        {item.status_tv && <MetaChip label="Status" value={item.status_tv} />}
        {item.releaseDate && <MetaChip label="First Aired" value={item.releaseDate} />}
        {item.language && <MetaChip label="Language" value={item.language.toUpperCase()} />}
      </View>
      {item.cast?.length > 0 && (
        <View style={styles.subSection}>
          <SectionHeader title="Cast" />
          <Text style={{ fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, color: theme.textSecondary, lineHeight: 22 }}>
            {item.cast.join(" · ")}
          </Text>
        </View>
      )}
      {item.genre?.length > 0 && (
        <View style={styles.subSection}>
          <SectionHeader title="Genres" />
          <GenrePills genres={item.genre} accent={theme.accentTV} />
        </View>
      )}
    </View>
  );
}

function GameInfo({ item }: { item: any }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={styles.infoPanel}>
      <View style={styles.chipRow}>
        {item.hoursPlayed ? <MetaChip label="Hours Played" value={`${item.hoursPlayed}h`} accent={theme.accentGames} /> : null}
        {item.releaseDate && <MetaChip label="Released" value={item.releaseDate} />}
        {item.igdbRating && <MetaChip label="IGDB Rating" value={`${item.igdbRating}/10`} accent={theme.accentGames} />}
      </View>
      {item.platform && (
        <View style={styles.subSection}>
          <SectionHeader title="Platforms" />
          <Text style={{ fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body, color: theme.textPrimary }}>
            {item.platform}
          </Text>
        </View>
      )}
      {item.developer && (
        <View style={styles.subSection}>
          <SectionHeader title="Developer" />
          <Text style={{ fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body, color: theme.textPrimary }}>
            {item.developer}
            {item.publisher_game && item.publisher_game !== item.developer
              ? `  ·  ${item.publisher_game} (Publisher)` : ""}
          </Text>
        </View>
      )}
      {item.genre?.length > 0 && (
        <View style={styles.subSection}>
          <SectionHeader title="Genres" />
          <GenrePills genres={item.genre} accent={theme.accentGames} />
        </View>
      )}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const item = useLibraryStore((s) => s.items[id as string]);
  const updateItem = useLibraryStore((s) => s.updateItem);
  const removeItem = useLibraryStore((s) => s.removeItem);
  const [editVisible, setEditVisible] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState(item?.status);
  const [optimisticRating, setOptimisticRating] = useState(item?.rating ?? 0);

  useEffect(() => { if (item) { setOptimisticStatus(item.status); setOptimisticRating(item.rating); } }, [item?.status, item?.rating]);

  if (!item) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnAlt}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.textSecondary, fontFamily: Typography.fontFamily.primary }}>Item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = {
    book: theme.accentBooks,
    movie: theme.accentMovies,
    tv: theme.accentTV,
    game: theme.accentGames,
  }[item.type];

  const handleDelete = () => {
    Alert.alert("Remove Item", `Remove "${item.title}" from your library?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { removeItem(id); router.back(); } },
    ]);
  };

  const handleRate = (rating: number) => {
    if (optimisticRating === rating) return;
    setOptimisticRating(rating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    requestAnimationFrame(() => updateItem(id as string, { rating }));
  };

  const handleStatusChange = (status: "want" | "inprogress" | "completed") => {
    if (optimisticStatus === status) return;
    setOptimisticStatus(status);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    requestAnimationFrame(() => updateItem(id as string, { status }));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Hero */}
      <View style={styles.hero}>
        {item.coverUrl ? (
          <>
            <Image source={{ uri: item.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={12} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.72)" }]} />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: accentColor + "30" }]} />
        )}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <ChevronLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setEditVisible(true)} style={styles.editBtn} accessibilityLabel="Edit item">
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Image source={{ uri: item.coverUrl || undefined }} style={styles.cover} contentFit="cover" transition={0} />
          <View style={styles.heroMeta}>
            <View style={[styles.typeBadge, { backgroundColor: accentColor + "20", borderColor: accentColor + "40" }]}>
              <Text style={[styles.typeBadgeText, { color: accentColor }]}>
                {item.type === "book" ? "Book" : item.type === "movie" ? "Film" : item.type === "tv" ? "TV Show" : "Game"}
              </Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={3}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.heroSubtitle} numberOfLines={1}>{item.subtitle}</Text> : null}
            {item.year ? <Text style={styles.heroYear}>{item.year}</Text> : null}
            <StarRating rating={optimisticRating} size={20} onRate={handleRate} editable />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((opt) => {
            const active = optimisticStatus === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleStatusChange(opt.value)}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: active ? accentColor : theme.surface2,
                    borderColor: active ? accentColor : theme.border,
                  },
                ]}
                accessibilityLabel={`Set status to ${opt.label}`}
              >
                <Text style={[styles.statusBtnText, { color: active ? "#FFF" : theme.textSecondary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        {item.description ? (
          <View style={styles.section}>
            <SectionHeader title={item.type === "book" ? "Synopsis" : item.type === "game" ? "About" : "Overview"} />
            <Text style={[styles.bodyText, { color: theme.textPrimary }]}>{item.description}</Text>
          </View>
        ) : null}

        {/* Type-specific info */}
        <View style={styles.section}>
          <SectionHeader title="Details" />
          {item.type === "book" && <BookInfo item={item} />}
          {item.type === "movie" && <MovieInfo item={item} />}
          {item.type === "tv" && <TVInfo item={item} />}
          {item.type === "game" && <GameInfo item={item} />}
        </View>

        {/* Tracking dates */}
        {(item.startDate || item.endDate || item.createdAt) && (
          <View style={styles.section}>
            <SectionHeader title="Your Timeline" />
            <View style={styles.chipRow}>
              <MetaChip label="Added" value={format(new Date(item.createdAt), "MMM d, yyyy")} />
              {item.startDate && <MetaChip label="Started" value={format(new Date(item.startDate), "MMM d, yyyy")} />}
              {item.endDate && <MetaChip label="Finished" value={format(new Date(item.endDate), "MMM d, yyyy")} accent={theme.success} />}
            </View>
          </View>
        )}

        {/* Notes */}
        {item.notes ? (
          <View style={styles.section}>
            <SectionHeader title="Your Notes" />
            <View style={[styles.notesCard, { backgroundColor: theme.surface2 }]}>
              <Text style={[styles.bodyText, { color: theme.textPrimary }]}>{item.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Delete */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: theme.destructive + "40" }]}
          onPress={handleDelete}
          accessibilityLabel="Remove from library"
        >
          <Trash2 size={16} color={theme.destructive} />
          <Text style={[styles.deleteBtnText, { color: theme.destructive }]}>Remove from Library</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddMediaSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        editId={id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { paddingTop: 80, paddingBottom: 24, justifyContent: "flex-end" },
  backBtn: {
    position: "absolute", top: Spacing.md, left: Spacing.md, zIndex: 10,
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center",
  },
  backBtnAlt: { margin: Spacing.md, width: 40, height: 40, justifyContent: "center" },
  editBtn: {
    position: "absolute", top: Spacing.md, right: Spacing.md, zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall, color: "#FFF" },
  heroContent: { flexDirection: "row", gap: Spacing.md, paddingHorizontal: Spacing.lg, alignItems: "flex-end" },
  cover: {
    width: 100, height: 150, borderRadius: BorderRadius.md,
    backgroundColor: "#2E2C2A",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  heroMeta: { flex: 1, gap: 6, paddingBottom: 4 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, marginBottom: 2 },
  typeBadgeText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption },
  heroTitle: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.h1, color: "#FFF", lineHeight: 28 },
  heroSubtitle: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall, color: "rgba(255,255,255,0.8)" },
  heroYear: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.caption, color: "rgba(255,255,255,0.55)" },
  scroll: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 100 },
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.sm, borderWidth: 1, alignItems: "center" },
  statusBtnText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  section: { gap: 0 },
  infoPanel: {},
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  subSection: { marginTop: 14 },
  bodyText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, lineHeight: 24 },
  notesCard: { borderRadius: BorderRadius.sm, padding: Spacing.md },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: BorderRadius.sm, borderWidth: 1,
  },
  deleteBtnText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
});
