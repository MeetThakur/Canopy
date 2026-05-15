import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  Edit3,
  Trash2,
  BookOpen,
  Clock,
  Calendar,
} from "lucide-react-native";
import { format } from "date-fns";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { useLibraryStore } from "../../stores/libraryStore";
import { CategoryBadge } from "../../components/media/CategoryBadge";
import { StatusPill } from "../../components/media/StatusPill";
import { StarRating } from "../../components/ui/StarRating";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import * as Haptics from "expo-haptics";

const STATUS_OPTIONS = [
  { label: "Want", value: "want" as const },
  { label: "In Progress", value: "inprogress" as const },
  { label: "Completed", value: "completed" as const },
];

function InfoRow({ label, value }: { label: string; value: string | number }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={infoStyles.box}>
      <Text style={[infoStyles.label, { color: theme.textTertiary }]}>
        {label}
      </Text>
      <Text
        style={[infoStyles.value, { color: theme.textPrimary }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  box: {
    width: "47%",
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
});

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const item = useLibraryStore((s) => s.items[id as string]);
  const updateItem = useLibraryStore((s) => s.updateItem);
  const removeItem = useLibraryStore((s) => s.removeItem);

  if (!item) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.background }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Typography.fontFamily.primary,
            }}
          >
            Item not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert("Remove Item", `Remove "${item.title}" from your library?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeItem(id);
          router.back();
        },
      },
    ]);
  };

  const handleRate = (rating: number) => {
    updateItem(id, { rating });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStatusChange = (status: "want" | "inprogress" | "completed") => {
    updateItem(id, { status });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const typeSpecificFields = () => {
    switch (item.type) {
      case "book":
        return [
          item.pages ? { label: "Pages", value: item.pages } : null,
          item.pagesRead
            ? { label: "Pages Read", value: item.pagesRead }
            : null,
        ].filter(Boolean);
      case "movie":
        return [
          item.runtime
            ? { label: "Runtime", value: `${item.runtime} min` }
            : null,
        ].filter(Boolean);
      case "tv":
        return [
          item.seasons ? { label: "Seasons", value: item.seasons } : null,
          item.episodesWatched
            ? { label: "Episodes Watched", value: item.episodesWatched }
            : null,
        ].filter(Boolean);
      case "game":
        return [
          item.platform ? { label: "Platform", value: item.platform } : null,
          item.hoursPlayed
            ? { label: "Hours Played", value: `${item.hoursPlayed}h` }
            : null,
        ].filter(Boolean);
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={10}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.7)" },
          ]}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Image
            source={{ uri: item.coverUrl || undefined }}
            style={styles.cover}
            contentFit="cover"
            transition={0}
          />
          <View style={styles.heroMeta}>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            ) : null}
            <View style={styles.badgeRow}>
              <CategoryBadge type={item.type} />
              {item.year && <Text style={styles.heroYear}>{item.year}</Text>}
            </View>
            <StarRating
              rating={item.rating}
              size={20}
              onRate={handleRate}
              editable
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
            Status
          </Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleStatusChange(opt.value)}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor:
                      item.status === opt.value
                        ? theme.textPrimary
                        : theme.surface2,
                    borderColor:
                      item.status === opt.value
                        ? theme.textPrimary
                        : theme.border,
                  },
                ]}
                accessibilityLabel={`Set status to ${opt.label}`}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    {
                      color:
                        item.status === opt.value
                          ? theme.background
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Details */}
        {item.description ? (
          <View style={styles.cleanSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              Synopsis
            </Text>
            <Text style={[styles.notes, { color: theme.textPrimary }]}>
              {item.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.cleanSection}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
            Details
          </Text>
          <View style={styles.detailsGrid}>
            {item.genre?.length ? (
              <InfoRow
                label="Genre"
                value={item.genre.slice(0, 2).join(", ")}
              />
            ) : null}
            {item.language ? (
              <InfoRow label="Language" value={item.language} />
            ) : null}
            {typeSpecificFields().map(
              (f) =>
                f && (
                  <InfoRow
                    key={f.label}
                    label={f.label}
                    value={f.value as string | number}
                  />
                ),
            )}
            {item.startDate ? (
              <InfoRow
                label="Started"
                value={format(new Date(item.startDate), "MMM d, yyyy")}
              />
            ) : null}
            {item.endDate ? (
              <InfoRow
                label="Finished"
                value={format(new Date(item.endDate), "MMM d, yyyy")}
              />
            ) : null}
          </View>
        </View>

        {/* Notes */}
        {item.notes ? (
          <View style={styles.cleanSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              Your Notes
            </Text>
            <Text style={[styles.notes, { color: theme.textPrimary }]}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        {/* Delete */}
        <Button
          title="Remove from Library"
          variant="destructive"
          onPress={handleDelete}
          style={styles.deleteBtn}
          accessibilityLabel="Remove item from library"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { paddingTop: 80, paddingBottom: 20, justifyContent: "flex-end" },
  backBtn: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  heroContent: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  cover: {
    width: 110,
    height: 165,
    borderRadius: BorderRadius.md,
    backgroundColor: "#2E2C2A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  heroMeta: {
    flex: 1,
    alignItems: "flex-start",
    gap: Spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    marginTop: 2,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.h1,
    color: "#FFF",
    lineHeight: 32,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.body,
    color: "rgba(255,255,255,0.9)",
  },
  heroYear: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
    color: "rgba(255,255,255,0.8)",
  },
  scroll: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 100 },
  section: { gap: Spacing.md },
  cleanSection: { gap: Spacing.sm },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  statusRow: { flexDirection: "row", gap: Spacing.sm },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  statusBtnText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  notes: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    lineHeight: 24,
  },
  deleteBtn: { marginTop: Spacing.sm },
});
