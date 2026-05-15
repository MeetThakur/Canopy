import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, Play } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { ActivityFeed } from '../../components/home/ActivityFeed';
import { CoverCard } from '../../components/media/CoverCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddMediaSheet } from '../../components/sheets/AddMediaSheet';
import { useLibraryStore } from '../../stores/libraryStore';
import { CategoryBadge } from '../../components/media/CategoryBadge';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const itemsMap = useLibraryStore((s) => s.items);
  const allItems = React.useMemo(() => {
    return Object.values(itemsMap).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [itemsMap]);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const inProgress = allItems.filter((i) => i.status === 'inprogress');
  const primaryItem = inProgress.length > 0 ? inProgress[0] : null;
  const otherInProgress = inProgress.slice(1, 6);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textTertiary} />
        }
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>Kanopi</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="Add new item"
          >
            <Plus size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Hero: Jump Back In */}
        {primaryItem ? (
          <View style={styles.heroSection}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary, paddingHorizontal: Spacing.md }]}>
              Jump Back In
            </Text>
            <TouchableOpacity 
              style={styles.heroCard}
              onPress={() => router.push(`/media/${primaryItem.id}`)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: primaryItem.coverUrl || undefined }}
                style={styles.heroCover}
                contentFit="cover"
              />
              <View style={[styles.heroOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]} />
              
              <View style={styles.heroContent}>
                <View style={styles.heroTop}>
                  <View style={styles.heroBadge}>
                    <CategoryBadge type={primaryItem.type} size={14} />
                  </View>
                </View>
                <View style={styles.heroBottom}>
                  <Text style={styles.heroTitle} numberOfLines={2}>{primaryItem.title}</Text>
                  {primaryItem.subtitle && (
                    <Text style={styles.heroSubtitle} numberOfLines={1}>{primaryItem.subtitle}</Text>
                  )}
                  <View style={styles.heroAction}>
                    <Text style={styles.heroActionText}>Continue</Text>
                    <ChevronRight size={16} color="#FFF" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.emptyInline, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <EmptyState
              title="Your library awaits"
              description="Start tracking the stories you're experiencing right now."
              actionLabel="Add Item"
              onAction={() => setSheetVisible(true)}
              style={{ padding: Spacing.xl }}
            />
          </View>
        )}

        {/* Up Next */}
        {otherInProgress.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Up Next</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
              {otherInProgress.map((item) => (
                <CoverCard key={item.id} item={item} onPress={() => router.push(`/media/${item.id}`)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <ActivityFeed />
        </View>
      </ScrollView>

      <AddMediaSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: Spacing.md,
  },
  appName: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.display },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroCover: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 8,
  },
  heroBottom: {
    gap: 4,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 28,
    color: '#FFF',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
    color: 'rgba(255,255,255,0.8)',
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  heroActionText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  sectionTitle: { 
    fontFamily: Typography.fontFamily.primarySemiBold, 
    fontSize: Typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardRow: { paddingHorizontal: Spacing.md, gap: 12 },
  emptyInline: {
    marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
    marginBottom: Spacing.xl, overflow: 'hidden',
  },
});
