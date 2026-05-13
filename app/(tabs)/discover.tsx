import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useDiscoverStore } from '../../stores/discoverStore';
import { MediaSearchResult } from '../../types/api';
import { SkeletonLoader, MediaCardSkeleton } from '../../components/ui/SkeletonLoader';
import { CategoryBadge } from '../../components/media/CategoryBadge';
import { MediaType } from '../../types/media';
import { Plus } from 'lucide-react-native';

function DiscoverCard({ item }: { item: MediaSearchResult }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity style={styles.discoverCard} accessibilityLabel={`View ${item.title}`}>
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={styles.discoverCover}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.discoverOverlay}>
        <CategoryBadge type={item.type as MediaType} />
        <Text style={styles.discoverTitle} numberOfLines={2}>{item.title}</Text>
        {item.year && (
          <Text style={styles.discoverYear}>{item.year}</Text>
        )}
        <TouchableOpacity style={styles.addBtn} accessibilityLabel={`Add ${item.title} to library`}>
          <Plus size={14} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SectionRow({ title, items, loading }: { title: string; items: MediaSearchResult[]; loading: boolean }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MediaCardSkeleton key={i} />)
          : items.map((item) => <DiscoverCard key={item.id} item={item} />)
        }
      </ScrollView>
    </View>
  );
}

export default function DiscoverScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { movies, books, games, loading, fetchTrending } = useDiscoverStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrending();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textSecondary} />
        }
      >
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Discover</Text>
          <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
            What's trending this week
          </Text>
        </View>

        <SectionRow title="🎬 Trending Movies & TV" items={movies.slice(0, 10)} loading={loading} />
        <SectionRow title="📚 Popular Books" items={books.slice(0, 10)} loading={loading} />
        <SectionRow title="🎮 Top Rated Games" items={games.slice(0, 10)} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 80 },
  headerRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.display,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },
  sectionContainer: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h3,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  discoverCard: {
    width: 140,
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  discoverCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2E2C2A',
  },
  discoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    justifyContent: 'flex-end',
    padding: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  discoverTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.bodySmall,
    color: '#FFF',
  },
  discoverYear: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  addBtnText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    color: '#FFF',
  },
});
