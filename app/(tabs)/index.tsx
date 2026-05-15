import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Plus, ChevronRight, BookOpen, Tv, Gamepad2, Film } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { useStatsStore } from '../../stores/statsStore';
import { MediaItem, MediaType } from '../../types/media';

const { width: SCREEN_W } = Dimensions.get('window');

function typeIcon(type: MediaType, color: string, size = 13) {
  if (type === 'book') return <BookOpen size={size} color={color} />;
  if (type === 'movie') return <Film size={size} color={color} />;
  if (type === 'tv') return <Tv size={size} color={color} />;
  return <Gamepad2 size={size} color={color} />;
}

// ─── Featured wide card ───────────────────────────────────────────────────────

function FeaturedCard({ item, onPress, accent }: { item: MediaItem; onPress: () => void; accent: string }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.featuredCard, { borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={item.title}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      <View style={styles.featuredInner}>
        <View style={[styles.featuredTypePill, { borderColor: 'rgba(255,255,255,0.3)' }]}>
          {typeIcon(item.type, '#FFF', 11)}
          <Text style={[styles.featuredTypeText, { color: '#FFF' }]}>
            {item.type === 'book' ? 'Book' : item.type === 'movie' ? 'Film' : item.type === 'tv' ? 'Show' : 'Game'}
          </Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.featuredSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Compact in-progress card ─────────────────────────────────────────────────

function CompactCard({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
      style={[styles.compactCard, { backgroundColor: theme.background, borderColor: theme.border }]}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <View style={[styles.compactCoverWrap, { borderColor: theme.border }]}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.compactCover}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View style={styles.compactMeta}>
        <Text style={[styles.compactTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.compactSub, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={16} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const itemsMap = useLibraryStore((s) => s.items);
  const { stats, recalculateStats } = useStatsStore();
  const [refreshing, setRefreshing] = useState(false);

  const allItems = useMemo(
    () => Object.values(itemsMap).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
    [itemsMap]
  );

  const inProgress = useMemo(() => allItems.filter((i) => i.status === 'inprogress'), [allItems]);
  const wantItems = useMemo(() => allItems.filter((i) => i.status === 'want').slice(0, 4), [allItems]);
  const featuredItem = inProgress[0] ?? null;
  const otherInProgress = inProgress.slice(1, 4);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculateStats();
    setTimeout(() => setRefreshing(false), 600);
  }, [recalculateStats]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textTertiary} />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.countHuge, { color: theme.textPrimary }]}>
              {stats.totalItems}
            </Text>
            <Text style={[styles.pageTitleHuge, { color: theme.textPrimary }]}>
              Items
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={20} color={theme.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Filter Pills (Decorative for now, navigate to library later) ── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterPills}
        >
          {['All Collection', 'Books', 'Films', 'Shows', 'Games'].map((pill, i) => (
            <TouchableOpacity 
              key={pill} 
              style={[
                styles.pillOutline, 
                { 
                  borderColor: i === 0 ? theme.textPrimary : theme.border,
                  backgroundColor: i === 0 ? theme.textPrimary : 'transparent'
                }
              ]}
              onPress={() => router.push('/(tabs)/library')}
            >
              <Text style={[
                styles.pillOutlineText,
                { color: i === 0 ? theme.background : theme.textPrimary }
              ]}>
                {pill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── In Progress ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              IN PROGRESS
            </Text>
          </View>

          {featuredItem ? (
            <View style={styles.featuredSection}>
              <FeaturedCard
                item={featuredItem}
                onPress={() => router.push(`/media/${featuredItem.id}`)}
                accent={theme.textPrimary}
              />
              {otherInProgress.length > 0 && (
                <View style={styles.compactList}>
                  {otherInProgress.map((item) => (
                    <CompactCard
                      key={item.id}
                      item={item}
                      onPress={() => router.push(`/media/${item.id}`)}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.emptyCard, { borderColor: theme.border }]}
              onPress={() => setSheetVisible(true)}
            >
              <Plus size={24} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                No items in progress
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Want to ── */}
        {wantItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                UP NEXT
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wantRow}
            >
              {wantItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.wantCard}
                  onPress={() => router.push(`/media/${item.id}`)}
                  accessibilityLabel={item.title}
                >
                  <View style={[styles.wantCoverWrap, { borderColor: theme.border }]}>
                    <Image
                      source={{ uri: item.coverUrl || undefined }}
                      style={styles.wantCover}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                  <Text style={[styles.wantTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <AddMediaSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: 20, paddingBottom: Spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  countHuge: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 54,
    lineHeight: 56,
  },
  pageTitleHuge: { 
    fontFamily: Typography.fontFamily.heading, 
    fontSize: 42,
    lineHeight: 46,
  },
  addBtn: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },

  // Pills
  filterPills: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  pillOutline: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  pillOutlineText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },

  // Sections
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.body,
    letterSpacing: 1,
  },

  // Featured
  featuredSection: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  featuredCard: {
    width: '100%', height: 200,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'flex-end',
  },
  featuredInner: { padding: 20, gap: 6 },
  featuredTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  featuredTypeText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.sizes.h1,
    color: '#FFF',
    lineHeight: 28,
  },
  featuredSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255,255,255,0.7)',
  },

  // Compact card
  compactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 12, borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  compactCoverWrap: {
    width: 44, height: 62, borderRadius: 6,
    overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth,
  },
  compactCover: { width: '100%', height: '100%' },
  compactMeta: { flex: 1 },
  compactTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  compactSub: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall, marginTop: 2 },
  compactList: { gap: Spacing.sm },

  // Empty state
  emptyCard: {
    marginHorizontal: Spacing.md, height: 140,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  emptyText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body },

  // Want row
  wantRow: { paddingHorizontal: Spacing.md, gap: 14 },
  wantCard: { width: 110 },
  wantCoverWrap: {
    width: 110, height: 160, borderRadius: BorderRadius.sm,
    marginBottom: 8, overflow: 'hidden', borderWidth: 1,
  },
  wantCover: { width: '100%', height: '100%' },
  wantTitle: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: 13, lineHeight: 18 },
});
