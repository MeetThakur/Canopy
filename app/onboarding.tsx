import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, Film, Tv, Gamepad2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MMKV } from 'react-native-mmkv';
import { Colors } from '../constants/colors';
import { useTheme, useThemeStore } from '../hooks/useTheme';
import { Typography } from '../constants/typography';
import { BorderRadius, Spacing } from '../constants/spacing';

const { width } = Dimensions.get('window');
const storage = new MMKV({ id: 'app-storage' });

const SLIDES = [
  {
    id: '1',
    emoji: '🌿',
    title: 'Kanopi',
    subtitle: 'Everything under one Kanopi',
    description: 'Your personal media companion for books, movies, TV shows, and games — all in one calm, beautiful place.',
  },
  {
    id: '2',
    emoji: null,
    title: 'Track everything\nyou love',
    subtitle: '',
    description: 'One app for every story, every film, every level — always organized, always yours.',
  },
  {
    id: '3',
    emoji: '✨',
    title: 'Choose your look',
    subtitle: 'Pick a theme to get started',
    description: '',
  },
];

function Slide1({ theme }: { theme: typeof Colors.dark }) {
  return (
    <View style={styles.slide}>
      <Text style={styles.bigEmoji}>🌿</Text>
      <Text style={[styles.slideDisplay, { color: theme.textPrimary }]}>Kanopi</Text>
      <Text style={[styles.slideTagline, { color: theme.accentBooks }]}>Everything under one Kanopi</Text>
      <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>
        Your personal media companion for books, movies, TV shows, and games — all in one calm, beautiful place.
      </Text>
    </View>
  );
}

function Slide2({ theme }: { theme: typeof Colors.dark }) {
  const icons = [
    { Icon: Book, color: theme.accentBooks, label: 'Books' },
    { Icon: Film, color: theme.accentMovies, label: 'Movies' },
    { Icon: Tv, color: theme.accentTV, label: 'TV Shows' },
    { Icon: Gamepad2, color: theme.accentGames, label: 'Games' },
  ];
  return (
    <View style={styles.slide}>
      <Text style={[styles.slideDisplay, { color: theme.textPrimary }]}>{'Track everything\nyou love'}</Text>
      <View style={styles.iconsGrid}>
        {icons.map(({ Icon, color, label }) => (
          <View key={label} style={[styles.iconCard, { backgroundColor: color + '20', borderColor: color + '40' }]}>
            <Icon size={32} color={color} />
            <Text style={[styles.iconLabel, { color: theme.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>One app for every story, every film, every level.</Text>
    </View>
  );
}

function Slide3({ theme, onStart }: { theme: typeof Colors.dark; onStart: () => void }) {
  const { themeMode, setThemeMode } = useThemeStore();
  const options: { label: string; value: 'light' | 'dark' | 'system' }[] = [
    { label: '☀️ Light', value: 'light' },
    { label: '🌙 Dark', value: 'dark' },
    { label: '⚙️ System', value: 'system' },
  ];
  return (
    <View style={styles.slide}>
      <Text style={styles.bigEmoji}>✨</Text>
      <Text style={[styles.slideDisplay, { color: theme.textPrimary }]}>Choose your look</Text>
      <View style={styles.themeOptions}>
        {options.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setThemeMode(value)}
            style={[styles.themeOption, { borderColor: themeMode === value ? theme.accentBooks : theme.border, backgroundColor: themeMode === value ? theme.accentBooks + '15' : theme.surface2 }]}
            accessibilityLabel={`Select ${value} theme`}
          >
            <Text style={[styles.themeOptionText, { color: themeMode === value ? theme.accentBooks : theme.textSecondary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.textPrimary }]} onPress={onStart} accessibilityLabel="Start using Kanopi">
        <Text style={[styles.startBtnText, { color: theme.background }]}>Start Tracking →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const handleStart = () => {
    storage.set('onboarding_complete', true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={{ width }}>
      {index === 0 && <Slide1 theme={theme} />}
      {index === 1 && <Slide2 theme={theme} />}
      {index === 2 && <Slide3 theme={theme} onStart={handleStart} />}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? theme.textPrimary : theme.border, width: i === currentIndex ? 20 : 8 }]} />
        ))}
      </View>

      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity onPress={handleNext} style={[styles.nextBtn, { backgroundColor: theme.textPrimary }]} accessibilityLabel="Next slide">
          <Text style={[styles.nextBtnText, { color: theme.background }]}>Next →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  slide: { width, flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  bigEmoji: { fontSize: 64 },
  slideDisplay: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.sizes.display, textAlign: 'center', lineHeight: 40 },
  slideTagline: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body, textAlign: 'center' },
  slideDesc: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, textAlign: 'center', lineHeight: 24 },
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
  iconCard: { width: 120, height: 100, borderRadius: BorderRadius.lg, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  iconLabel: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  themeOptions: { width: '100%', gap: Spacing.sm },
  themeOption: { paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, alignItems: 'center' },
  themeOptionText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body },
  startBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  startBtnText: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.body },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, paddingBottom: Spacing.md },
  dot: { height: 8, borderRadius: BorderRadius.full },
  nextBtn: { marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, alignItems: 'center' },
  nextBtnText: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.body },
});
