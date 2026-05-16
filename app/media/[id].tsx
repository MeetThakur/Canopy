import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft, Trash2, Plus, Minus
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
import { LinearGradient } from "expo-linear-gradient";

const STATUS_OPTIONS = [
  { label: "Want", value: "want" as const },
  { label: "In Progress", value: "inprogress" as const },
  { label: "Completed", value: "completed" as const },
];

// ─── Progress Tracker ────────────────────────────────────────────────────────

function ProgressTracker({ 
  label, 
  current, 
  total, 
  onIncrement, 
  onDecrement 
}: { 
  label: string; 
  current: number; 
  total?: number; 
  onIncrement: () => void; 
  onDecrement: () => void;
}) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.progressControls}>
        <TouchableOpacity 
          style={[styles.progressBtn, { borderColor: theme.border }]} 
          onPress={onDecrement}
        >
          <Minus size={16} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.progressValue, { color: theme.textPrimary }]}>
          {current} {total ? <Text style={{ color: theme.textTertiary }}>/ {total}</Text> : null}
        </Text>
        <TouchableOpacity 
          style={[styles.progressBtn, { borderColor: theme.border }]} 
          onPress={onIncrement}
        >
          <Plus size={16} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
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

  useEffect(() => { 
    if (item) { 
      setOptimisticStatus(item.status); 
      setOptimisticRating(item.rating); 
    } 
  }, [item?.status, item?.rating]);

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

  const handleDelete = () => {
    Alert.alert("Remove Item", `Remove "${item.title}" from your library?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { removeItem(id as string); router.back(); } },
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    requestAnimationFrame(() => updateItem(id as string, { status }));
  };

  const handleProgressUpdate = (field: 'pagesRead' | 'episodesWatched' | 'hoursPlayed', increment: boolean) => {
    const currentVal = (item as any)[field] || 0;
    const newVal = Math.max(0, increment ? currentVal + 1 : currentVal - 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateItem(id as string, { [field]: newVal });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Stark Hero Cover */}
        <View style={styles.heroCoverWrap}>
          {item.coverUrl ? (
            <Image 
              source={{ uri: item.coverUrl }} 
              style={StyleSheet.absoluteFill} 
              contentFit="cover" 
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface2 }]} />
          )}
          <LinearGradient
            colors={['transparent', theme.background]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
          />
          <SafeAreaView style={styles.heroHeaderSafe}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditVisible(true)} style={styles.editBtn} accessibilityLabel="Edit item">
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          
          <Text style={[styles.typeText, { color: theme.textSecondary }]}>
            {item.type.toUpperCase()}
          </Text>
          
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {item.title}
          </Text>
          
          {item.subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {item.subtitle}
            </Text>
          ) : null}

          <View style={styles.ratingWrap}>
            <StarRating rating={optimisticRating} size={24} onRate={handleRate} editable />
          </View>

          {/* Status Selection */}
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => {
              const active = optimisticStatus === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleStatusChange(opt.value)}
                  style={[
                    styles.statusPill,
                    {
                      borderColor: active ? theme.textPrimary : theme.border,
                      backgroundColor: active ? theme.textPrimary : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: active ? theme.background : theme.textSecondary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Progress Tracking */}
          {item.status === 'inprogress' && (
            <View style={[styles.section, { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 24 }]}>
              {item.type === 'book' && (
                <ProgressTracker 
                  label="Pages Read" 
                  current={item.pagesRead || 0} 
                  total={item.pages}
                  onIncrement={() => handleProgressUpdate('pagesRead', true)}
                  onDecrement={() => handleProgressUpdate('pagesRead', false)}
                />
              )}
              {item.type === 'tv' && (
                <ProgressTracker 
                  label="Episodes Watched" 
                  current={item.episodesWatched || 0} 
                  total={item.numberOfEpisodes}
                  onIncrement={() => handleProgressUpdate('episodesWatched', true)}
                  onDecrement={() => handleProgressUpdate('episodesWatched', false)}
                />
              )}
              {item.type === 'game' && (
                <ProgressTracker 
                  label="Hours Played" 
                  current={item.hoursPlayed || 0} 
                  onIncrement={() => handleProgressUpdate('hoursPlayed', true)}
                  onDecrement={() => handleProgressUpdate('hoursPlayed', false)}
                />
              )}
            </View>
          )}

          {/* Description */}
          {item.description ? (
            <View style={styles.section}>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          ) : null}

          {/* Minimal Meta info */}
          <View style={[styles.section, { gap: 12 }]}>
            {item.year && <Text style={[styles.metaText, { color: theme.textTertiary }]}>Released: <Text style={{ color: theme.textPrimary }}>{item.year}</Text></Text>}
            {item.genre && item.genre.length > 0 && <Text style={[styles.metaText, { color: theme.textTertiary }]}>Genre: <Text style={{ color: theme.textPrimary }}>{item.genre.join(', ')}</Text></Text>}
            {item.createdAt && <Text style={[styles.metaText, { color: theme.textTertiary }]}>Added to Library: <Text style={{ color: theme.textPrimary }}>{format(new Date(item.createdAt), "MMM d, yyyy")}</Text></Text>}
          </View>

          {/* Notes */}
          {item.notes ? (
            <View style={styles.section}>
              <Text style={[styles.notesHeading, { color: theme.textPrimary }]}>Personal Notes</Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>{item.notes}</Text>
            </View>
          ) : null}

          {/* Delete */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
          >
            <Text style={[styles.deleteBtnText, { color: theme.destructive }]}>Remove from Collection</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>

      <AddMediaSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        editId={id as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  
  // Hero
  heroCoverWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  heroHeaderSafe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  backBtnAlt: { margin: Spacing.md, width: 40, height: 40, justifyContent: 'center' },
  editBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  editBtnText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall, color: "#FFF" },
  
  // Content
  contentArea: {
    paddingHorizontal: Spacing.xl,
    marginTop: -40, // Pull up over gradient
  },
  typeText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.body,
    marginBottom: 20,
  },
  ratingWrap: {
    marginBottom: 24,
  },
  
  // Status
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statusPill: { 
    paddingVertical: 10, paddingHorizontal: 16, 
    borderRadius: 24, borderWidth: 1, 
  },
  statusPillText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.bodySmall },
  
  // Sections
  section: { marginBottom: 32 },
  bodyText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, lineHeight: 24 },
  metaText: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.bodySmall },
  notesHeading: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.bodySmall, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  
  deleteBtn: {
    alignItems: "flex-start",
    paddingVertical: 12, marginTop: 40,
  },
  deleteBtnText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body },

  // Progress Tracker
  progressContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.body,
  },
  progressControls: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  progressBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  progressValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h2,
    minWidth: 40, textAlign: 'center',
  },
});
