import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { CategoryBadge } from '../../components/media/CategoryBadge';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { MediaType } from '../../types/media';

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
  }>();

  const [addSheetVisible, setAddSheetVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: params.coverUrl || undefined }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={20}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Image
            source={{ uri: params.coverUrl || undefined }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.heroMeta}>
            <CategoryBadge type={params.type as MediaType} />
            <Text style={styles.heroTitle} numberOfLines={3}>{params.title}</Text>
            {params.subtitle ? (
              <Text style={styles.heroSubtitle} numberOfLines={2}>{params.subtitle}</Text>
            ) : null}
            {params.year ? <Text style={styles.heroYear}>{params.year}</Text> : null}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          This item is not yet in your library. Add it to keep track of your status, rating, and notes!
        </Text>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.textPrimary }]}
          onPress={() => setAddSheetVisible(true)}
        >
          <Plus size={20} color={theme.background} />
          <Text style={[styles.addBtnText, { color: theme.background }]}>Add to Library</Text>
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
        prefillSourceId={params.sourceId}
        prefill={{
          title: params.title || '',
          subtitle: params.subtitle || '',
          coverUrl: params.coverUrl || '',
          type: (params.type as MediaType) || 'book',
          year: params.year ? parseInt(params.year, 10) : undefined,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { height: 320, justifyContent: 'flex-end' },
  backBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  heroContent: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    alignItems: 'flex-end',
  },
  cover: {
    width: 120,
    height: 180,
    borderRadius: BorderRadius.md,
    backgroundColor: '#2E2C2A',
  },
  heroMeta: {
    flex: 1,
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.h1,
    color: '#FFF',
    lineHeight: 30,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    color: 'rgba(255,255,255,0.7)',
  },
  heroYear: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  scroll: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    alignItems: 'center',
  },
  infoText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
