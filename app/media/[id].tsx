import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Pressable, Animated, LayoutAnimation, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft, Trash2, Plus, Minus, Share2, CheckCircle2, Bookmark
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
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

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
  color,
  onChangeValue,
  onIncrement, 
  onDecrement 
}: { 
  label: string; 
  current: number; 
  total?: number; 
  color: string;
  onChangeValue: (val: number) => void;
  onIncrement: () => void; 
  onDecrement: () => void;
}) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(String(current));

  useEffect(() => {
    setEditText(String(current));
  }, [current]);

  const handleSave = () => {
    setIsEditing(false);
    const parsed = parseInt(editText, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChangeValue(total ? Math.min(total, parsed) : parsed);
    } else {
      setEditText(String(current));
    }
  };

  const pct = total ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;

  return (
    <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.progressHeaderRow}>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>{label}</Text>
        {total ? (
          <Text style={[styles.progressPercent, { color }]}>{pct}% Complete</Text>
        ) : null}
      </View>

      <View style={styles.progressControlsRow}>
        <TouchableOpacity 
          style={[styles.progressBtn, { borderColor: theme.border, backgroundColor: theme.surface2 }]} 
          onPress={onDecrement}
        >
          <Minus size={16} color={theme.textPrimary} />
        </TouchableOpacity>

        {isEditing ? (
          <TextInput
            style={[styles.progressInput, { color: theme.textPrimary, borderBottomColor: color }]}
            value={editText}
            onChangeText={setEditText}
            keyboardType="numeric"
            autoFocus
            onBlur={handleSave}
            onSubmitEditing={handleSave}
          />
        ) : (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)} 
            style={styles.progressValueWrapper}
            activeOpacity={0.7}
          >
            <Text style={[styles.progressValue, { color: theme.textPrimary }]}>
              {current}
            </Text>
            {total ? (
              <Text style={[styles.progressTotal, { color: theme.textTertiary }]}>
                / {total}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.progressBtn, { borderColor: theme.border, backgroundColor: theme.surface2 }]} 
          onPress={onIncrement}
        >
          <Plus size={16} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {total ? (
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { backgroundColor: color, width: `${pct}%` }]} />
        </View>
      ) : null}
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
  const [shareVisible, setShareVisible] = useState(false);
  
  const [optimisticStatus, setOptimisticStatus] = useState(item?.status);
  const [optimisticRating, setOptimisticRating] = useState(item?.rating ?? 0);

  const cardRef = useRef<View>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

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
      { text: "Remove", style: "destructive", onPress: () => { 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        removeItem(id as string); 
        router.back(); 
      } },
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOptimisticStatus(status);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    requestAnimationFrame(() => updateItem(id as string, { status }));
  };

  const handleProgressUpdate = (field: 'pagesRead' | 'episodesWatched' | 'hoursPlayed', increment: boolean) => {
    const currentVal = (item as any)[field] || 0;
    const totalVal = field === 'pagesRead' ? item.pages : field === 'episodesWatched' ? item.numberOfEpisodes : undefined;
    let newVal = increment ? currentVal + 1 : currentVal - 1;
    newVal = Math.max(0, newVal);
    if (totalVal !== undefined) {
      newVal = Math.min(totalVal, newVal);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateItem(id as string, { [field]: newVal });
  };

  // Card details calculations
  const getCardGradient = () => {
    if (item.type === "book") return ["#1E293B", "#0F172A"] as const;
    if (item.type === "tv") return ["#31102F", "#0F172A"] as const;
    if (item.type === "game") return ["#064E3B", "#0F172A"] as const;
    return ["#3B0764", "#0F172A"] as const;
  };

  const getCategoryLabel = () => {
    if (item.status === "completed") {
      if (item.type === "book") return "FINISHED READING";
      if (item.type === "tv") return "FINISHED WATCHING";
      if (item.type === "game") return "COMPLETED";
      return "WATCHED";
    }
    if (item.status === "inprogress") {
      if (item.type === "book") return "NOW READING";
      if (item.type === "tv") return "NOW WATCHING";
      if (item.type === "game") return "NOW PLAYING";
      return "NOW WATCHING";
    }
    return "WANT TO " + (item.type === "book" ? "READ" : item.type === "game" ? "PLAY" : "WATCH");
  };

  const getCategoryColor = () => {
    if (item.type === "book") return theme.accentBooks;
    if (item.type === "tv") return theme.accentTV;
    if (item.type === "game") return theme.accentGames;
    return theme.accentMovies;
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 0.9,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing Not Available", "Sharing is not supported on this device.");
      }
    } catch (error) {
      console.error("View shot capture error:", error);
      Alert.alert("Sharing Failed", "Failed to generate shareable card.");
    }
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
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setShareVisible(true)} style={styles.backBtn} accessibilityLabel="Share card">
                <Share2 size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditVisible(true)} style={styles.editBtn} accessibilityLabel="Edit item">
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Area */}
        <Animated.View style={[styles.contentArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
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
            <View style={[styles.section, { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 20 }]}>
              {item.type === 'book' && (
                <ProgressTracker 
                  label="Pages Read" 
                  current={item.pagesRead || 0} 
                  total={item.pages}
                  color={theme.accentBooks}
                  onChangeValue={(val) => updateItem(id as string, { pagesRead: val })}
                  onIncrement={() => handleProgressUpdate('pagesRead', true)}
                  onDecrement={() => handleProgressUpdate('pagesRead', false)}
                />
              )}
              {item.type === 'tv' && (
                <ProgressTracker 
                  label="Episodes Watched" 
                  current={item.episodesWatched || 0} 
                  total={item.numberOfEpisodes}
                  color={theme.accentTV}
                  onChangeValue={(val) => updateItem(id as string, { episodesWatched: val })}
                  onIncrement={() => handleProgressUpdate('episodesWatched', true)}
                  onDecrement={() => handleProgressUpdate('episodesWatched', false)}
                />
              )}
              {item.type === 'game' && (
                <ProgressTracker 
                  label="Hours Played" 
                  current={item.hoursPlayed || 0} 
                  color={theme.accentGames}
                  onChangeValue={(val) => updateItem(id as string, { hoursPlayed: val })}
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
            {item.imdbRating && <Text style={[styles.metaText, { color: theme.textTertiary }]}>Rating: <Text style={{ color: theme.textPrimary }}>{item.imdbRating} / 10</Text></Text>}
            {item.boxOffice && <Text style={[styles.metaText, { color: theme.textTertiary }]}>Box Office: <Text style={{ color: theme.textPrimary }}>{item.boxOffice}</Text></Text>}
            {item.awards && <Text style={[styles.metaText, { color: theme.textTertiary }]}>Awards: <Text style={{ color: theme.textPrimary }}>{item.awards}</Text></Text>}
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
          
        </Animated.View>
      </ScrollView>

      <AddMediaSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        editId={id as string}
      />

      {/* ─── Share Card Preview Modal ─── */}
      <Modal
        visible={shareVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setShareVisible(false)}
      >
        <View style={styles.shareModalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShareVisible(false)} />
          <View style={[styles.shareModalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.shareModalTitle, { color: theme.textPrimary }]}>Share Your Card</Text>
            
            {/* Card Preview Container */}
            <View style={styles.cardPreviewContainer}>
              <View 
                ref={cardRef} 
                collapsable={false}
                style={styles.shareCardContainer}
              >
                <LinearGradient
                  colors={getCardGradient()}
                  style={styles.shareCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.shareCardHeader}>
                    <Text style={styles.shareCardBrand}>🌿 canopy.</Text>
                  </View>

                  <View style={styles.shareCardBody}>
                    {item.coverUrl ? (
                      <Image 
                        source={{ uri: item.coverUrl }} 
                        style={styles.shareCardCover} 
                        contentFit="cover" 
                      />
                    ) : (
                      <View style={[styles.shareCardCover, { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>No Cover</Text>
                      </View>
                    )}

                    <View style={styles.shareCardMeta}>
                      <Text style={[styles.shareCardStatusLabel, { color: getCategoryColor() }]}>
                        {getCategoryLabel()}
                      </Text>
                      <Text style={styles.shareCardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.subtitle ? (
                        <Text style={styles.shareCardSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.shareCardProgressSection}>
                    {item.status === 'inprogress' && (
                      <>
                        <View style={styles.shareCardProgressInfo}>
                          <Text style={styles.shareCardProgressText}>
                            {item.type === 'book' && `${item.pagesRead || 0} of ${item.pages || '?'} pages`}
                            {item.type === 'tv' && `${item.episodesWatched || 0} of ${item.numberOfEpisodes || '?'} episodes`}
                            {item.type === 'game' && `${item.hoursPlayed || 0} hours played`}
                          </Text>
                          {item.type !== 'game' && (item.pages || item.numberOfEpisodes) ? (
                            <Text style={[styles.shareCardProgressPercent, { color: getCategoryColor() }]}>
                              {Math.min(100, Math.round((((item.type === 'book' ? item.pagesRead : item.episodesWatched) || 0) / ((item.type === 'book' ? item.pages : item.numberOfEpisodes) || 1)) * 100))}%
                            </Text>
                          ) : null}
                        </View>
                        {item.type !== 'game' && (item.pages || item.numberOfEpisodes) ? (
                          <View style={styles.shareCardProgressTrack}>
                            <View style={[styles.shareCardProgressFill, { 
                              backgroundColor: getCategoryColor(),
                              width: `${Math.min(100, Math.round((((item.type === 'book' ? item.pagesRead : item.episodesWatched) || 0) / ((item.type === 'book' ? item.pages : item.numberOfEpisodes) || 1)) * 100))}%`
                            }]} />
                          </View>
                        ) : null}
                      </>
                    )}

                    {item.status === 'completed' && (
                      <View style={styles.shareCardCompleted}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <CheckCircle2 size={16} color={theme.success} />
                          <Text style={styles.shareCardCompletedText}>COMPLETED</Text>
                        </View>
                        {item.rating > 0 ? (
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Text key={i} style={{ fontSize: 16, color: i < item.rating ? '#F59E0B' : '#4B5563' }}>
                                ★
                              </Text>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    )}

                    {item.status === 'want' && (
                      <View style={styles.shareCardCompleted}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Bookmark size={16} color={getCategoryColor()} />
                          <Text style={styles.shareCardCompletedText}>ADDED TO WISHLIST</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.shareModalActions}>
              <TouchableOpacity
                style={[styles.shareModalBtn, { backgroundColor: theme.textPrimary }]}
                onPress={handleShare}
              >
                <Text style={[styles.shareModalBtnText, { color: theme.background }]}>Share Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareModalBtnCancel, { borderColor: theme.border }]}
                onPress={() => setShareVisible(false)}
              >
                <Text style={[styles.shareModalBtnCancelText, { color: theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Progress Tracker Custom Upgrade
  progressCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progressPercent: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.caption,
  },
  progressControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: Spacing.xs,
  },
  progressBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', alignItems: 'center',
  },
  progressValueWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
    paddingHorizontal: 8,
    paddingBottom: 2,
    minWidth: 60,
    justifyContent: 'center',
  },
  progressValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h2,
    textAlign: 'center',
  },
  progressTotal: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
    marginLeft: 4,
  },
  progressInput: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.h2,
    textAlign: 'center',
    width: 85,
    borderBottomWidth: 2,
    paddingVertical: 0,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Share Card Preview Modal Styles
  shareModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalContent: {
    width: 350,
    borderRadius: 24,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  shareModalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  cardPreviewContainer: {
    width: 300,
    height: 420,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  shareCardContainer: {
    width: 300,
    height: 420,
  },
  shareCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  shareCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  shareCardBrand: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 11,
    color: '#FFF',
    opacity: 0.6,
    letterSpacing: 1.5,
  },
  shareCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  shareCardCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  shareCardMeta: {
    flex: 1,
    gap: 4,
  },
  shareCardStatusLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 8,
    letterSpacing: 1.5,
  },
  shareCardTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 20,
    color: '#FFF',
    lineHeight: 24,
  },
  shareCardSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 12,
    color: '#9CA3AF',
  },
  shareCardProgressSection: {
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  shareCardProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareCardProgressText: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: 11,
    color: '#E5E7EB',
  },
  shareCardProgressPercent: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 11,
  },
  shareCardProgressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  shareCardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  shareCardCompleted: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  shareCardCompletedText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 1,
  },
  shareModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  shareModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalBtnText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
  shareModalBtnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalBtnCancelText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.bodySmall,
  },
});
