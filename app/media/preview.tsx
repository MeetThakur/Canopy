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
              {itemInfo.title}
            </Text>
            {itemInfo.subtitle ? (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {itemInfo.subtitle}
              </Text>
            ) : null}
            <View style={styles.badgeRow}>
              <CategoryBadge type={itemInfo.type as MediaType} />
              {itemInfo.year ? (
                <Text style={styles.heroYear}>{itemInfo.year}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {itemInfo.description ? (
          <View style={styles.cleanSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              Synopsis
            </Text>
            <Text
              style={[styles.descriptionText, { color: theme.textPrimary }]}
            >
              {itemInfo.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.cleanSection}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
            Details
          </Text>
          <View style={styles.detailsGrid}>
            {itemInfo.genre && itemInfo.genre.length > 0 ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Genre
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {itemInfo.genre.slice(0, 2).join(", ")}
                </Text>
              </View>
            ) : null}
            {itemInfo.pages ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Pages
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {itemInfo.pages}
                </Text>
              </View>
            ) : null}
            {itemInfo.runtime ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Runtime
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {itemInfo.runtime} min
                </Text>
              </View>
            ) : null}
            {itemInfo.seasons ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Seasons
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {itemInfo.seasons}
                </Text>
              </View>
            ) : null}
            {itemInfo.platform ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Platforms
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {itemInfo.platform}
                </Text>
              </View>
            ) : null}
            {itemInfo.language ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>
                  Language
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {itemInfo.language}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          This item is not yet in your library. Add it to keep track of your
          status, rating, and notes!
        </Text>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.accent }]}
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
          // If the user adds the item, the store gets updated.
          // They might want to go back or stay, usually closing the sheet is enough.
          // In a more complex app, we might navigate them directly to the new item's detail page.
          router.back();
        }}
        prefillSourceId={itemInfo.sourceId}
        prefill={{
          title: itemInfo.title || "",
          subtitle: itemInfo.subtitle || "",
          coverUrl: itemInfo.coverUrl || "",
          type: (itemInfo.type as MediaType) || "book",
          year: itemInfo.year ? parseInt(itemInfo.year, 10) : undefined,
          description: itemInfo.description,
          pages: itemInfo.pages,
          runtime: itemInfo.runtime,
          seasons: itemInfo.seasons,
          platform: itemInfo.platform,
          language: itemInfo.language,
          genre: itemInfo.genre,
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
});
