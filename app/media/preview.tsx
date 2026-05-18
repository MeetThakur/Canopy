import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ChevronLeft, Plus } from "lucide-react-native";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { CategoryBadge } from "../../components/media/CategoryBadge";
import { AddMediaSheet } from "../../components/sheets/AddMediaSheet";
import { MediaType } from "../../types/media";
import { getMediaDetails } from "../../api/unified";
import { ActivityIndicator } from "react-native";

export default function MediaPreviewScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    sourceId: string;
    type: string;
    title: string;
    subtitle: string;
    coverUrl: string;
    year: string;
    itemData: string;
  }>();

  const itemInfo = params.itemData
    ? JSON.parse(params.itemData)
    : {
        id: params.id,
        sourceId: params.sourceId,
        type: params.type,
        title: params.title,
        subtitle: params.subtitle,
        coverUrl: params.coverUrl,
        year: params.year,
      };

  const [detailedInfo, setDetailedInfo] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function fetchDetails() {
      if (itemInfo.type !== 'book' && itemInfo.sourceId) {
        const details = await getMediaDetails(itemInfo.type, itemInfo.sourceId);
        if (mounted && details) {
          setDetailedInfo(details);
        }
      }
      if (mounted) setLoadingDetails(false);
    }
    fetchDetails();
    return () => { mounted = false; };
  }, [itemInfo.sourceId, itemInfo.type]);

  const finalInfo = { ...itemInfo, ...detailedInfo };

  const getAccentColor = (t: string) => {
    switch (t) {
      case 'movie': return theme.accentMovies;
      case 'tv': return theme.accentTV;
      case 'game': return theme.accentGames;
      default: return theme.accentBooks;
    }
  };

  const [addSheetVisible, setAddSheetVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: itemInfo.coverUrl || undefined }}
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
            source={{ uri: itemInfo.coverUrl || undefined }}
            style={styles.cover}
            contentFit="cover"
            transition={0}
          />
          <View style={styles.heroMeta}>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {finalInfo.title}
            </Text>
            {finalInfo.subtitle ? (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {finalInfo.subtitle}
              </Text>
            ) : null}
            <View style={styles.badgeRow}>
              <CategoryBadge type={finalInfo.type as MediaType} />
              {finalInfo.year ? (
                <Text style={styles.heroYear}>{finalInfo.year}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loadingDetails && (
          <View style={{ alignItems: 'center', padding: Spacing.xl }}>
            <ActivityIndicator color={theme.accent} />
          </View>
        )}

        {!loadingDetails && finalInfo.description ? (
          <View style={styles.cleanSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              Synopsis
            </Text>
            <Text
              style={[styles.descriptionText, { color: theme.textPrimary }]}
            >
              {finalInfo.description}
            </Text>
          </View>
        ) : null}

        {/* Genres */}
        {!loadingDetails && finalInfo.genre && finalInfo.genre.length > 0 ? (
          <View style={styles.cleanSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              Genres
            </Text>
            <View style={styles.genreRow}>
              {finalInfo.genre.map((g: string) => (
                <View key={g} style={[styles.genrePill, { backgroundColor: theme.surface2 }]}>
                  <Text style={[styles.genreText, { color: theme.textSecondary }]}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Cast / People */}
        {!loadingDetails && finalInfo.cast && finalInfo.cast.length > 0 ? (
          <View style={styles.cleanSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              Cast
            </Text>
            <Text style={[styles.descriptionText, { color: theme.textPrimary }]}>
              {finalInfo.cast.join(", ")}
            </Text>
          </View>
        ) : null}

        {!loadingDetails && (
        <View style={styles.cleanSection}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
            Details
          </Text>
          <View style={styles.detailsGrid}>
            {finalInfo.director ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Director
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>
                  {finalInfo.director}
                </Text>
              </View>
            ) : null}
            {finalInfo.developer ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Developer
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>
                  {finalInfo.developer}
                </Text>
              </View>
            ) : null}
            {finalInfo.network ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Network
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>
                  {finalInfo.network}
                </Text>
              </View>
            ) : null}
            {finalInfo.pages ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Pages
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {finalInfo.pages}
                </Text>
              </View>
            ) : null}
            {finalInfo.runtime ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Runtime
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {finalInfo.runtime} min
                </Text>
              </View>
            ) : null}
            {finalInfo.seasons ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Seasons
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {finalInfo.seasons}
                </Text>
              </View>
            ) : null}
            {finalInfo.platform ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Platforms
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {finalInfo.platform}
                </Text>
              </View>
            ) : null}
            {finalInfo.language ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Language
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {finalInfo.language}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        )}

        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          This item is not yet in your library. Add it to keep track of your
          status, rating, and notes!
        </Text>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: getAccentColor(finalInfo.type) }]}
          onPress={() => setAddSheetVisible(true)}
        >
          <Plus size={20} color="#FFF" />
          <Text style={[styles.addBtnText, { color: "#FFF" }]}>
            Add to Library
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AddMediaSheet
        visible={addSheetVisible}
        onClose={() => {
          setAddSheetVisible(false);
          router.back();
        }}
        prefillSourceId={finalInfo.sourceId}
        prefill={{
          title: finalInfo.title || "",
          subtitle: finalInfo.subtitle || "",
          coverUrl: finalInfo.coverUrl || "",
          type: (finalInfo.type as MediaType) || "book",
          year: finalInfo.year ? parseInt(finalInfo.year, 10) : undefined,
          description: finalInfo.description,
          pages: finalInfo.pages,
          runtime: finalInfo.runtime,
          seasons: finalInfo.seasons,
          platform: finalInfo.platform,
          language: finalInfo.language,
          genre: finalInfo.genre,
          releaseDate: finalInfo.releaseDate,
          director: finalInfo.director,
          cast: finalInfo.cast,
          tagline: finalInfo.tagline,
          numberOfEpisodes: finalInfo.numberOfEpisodes,
          network: finalInfo.network,
          status_tv: finalInfo.status_tv,
          developer: finalInfo.developer,
          publisher_game: finalInfo.publisher_game,
          igdbRating: finalInfo.igdbRating,
          publisher: finalInfo.publisher,
        }}
      />
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
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.xl,
    paddingBottom: 100,
  },
  cleanSection: { gap: Spacing.sm, width: "100%" },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  infoBox: {
    width: "47%",
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  infoText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    textAlign: "center",
    lineHeight: 24,
  },
  descriptionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    lineHeight: 22,
  },
  detailsBox: {
    width: "100%",
    gap: Spacing.sm,
  },
  detailItem: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  genrePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  genreText: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.bodySmall,
  },
});
