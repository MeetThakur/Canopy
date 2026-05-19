import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Book, Film, Tv, Gamepad2, ArrowRight, Sun, Moon, Monitor } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { useTheme, useThemeStore } from '../hooks/useTheme';
import { Typography } from '../constants/typography';
import { BorderRadius, Spacing } from '../constants/spacing';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1' },
  { id: '2' },
  { id: '3' },
];

function Slide1({ theme }: { theme: typeof Colors.dark }) {
  return (
    <View style={styles.slide}>
      <View style={[styles.brandMark, { borderColor: theme.accent + '30' }]}>
        <Text style={[styles.brandLetter, { color: theme.accent }]}>C</Text>
      </View>
      <Text style={[styles.slideDisplay, { color: theme.textPrimary }]}>Canopy</Text>
      <View style={[styles.divider, { backgroundColor: theme.accent }]} />
      <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>
        Track the books you read, the films you watch, the shows you follow, and the games you play.
      </Text>
    </View>
  );
}

function Slide2({ theme }: { theme: typeof Colors.dark }) {
  const categories = [
    { Icon: Book, color: theme.accentBooks, label: 'Books' },
    { Icon: Film, color: theme.accentMovies, label: 'Films' },
    { Icon: Tv, color: theme.accentTV, label: 'Shows' },
    { Icon: Gamepad2, color: theme.accentGames, label: 'Games' },
  ];
  return (
    <View style={styles.slide}>
      <Text style={[styles.slideTitle, { color: theme.textPrimary }]}>
        One place for{'\n'}everything you love
      </Text>
      <View style={styles.categoriesRow}>
        {categories.map(({ Icon, color, label }) => (
          <View key={label} style={styles.categoryItem}>
            <View style={[styles.categoryCircle, { backgroundColor: color + '15', borderColor: color + '25' }]}>
              <Icon size={24} color={color} />
            </View>
            <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Slide3({ theme, onStart, isDark }: { theme: typeof Colors.dark; onStart: () => void; isDark: boolean }) {
  const { themeMode, setThemeMode } = useThemeStore();
  const options: { label: string; value: 'light' | 'dark' | 'system'; Icon: typeof Sun }[] = [
    { label: 'Light', value: 'light', Icon: Sun },
    { label: 'Dark', value: 'dark', Icon: Moon },
    { label: 'System', value: 'system', Icon: Monitor },
  ];
  return (
    <View style={styles.slide}>
      <Text style={[styles.slideTitle, { color: theme.textPrimary }]}>Pick a theme</Text>
      <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>You can change this anytime in settings.</Text>
      <View style={styles.themeOptions}>
        {options.map(({ label, value, Icon }) => {
          const active = themeMode === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setThemeMode(value)}
              style={[
                styles.themeOption,
                {
                  borderColor: active ? theme.accent : theme.border,
                  backgroundColor: active ? theme.accent + '10' : 'transparent',
                },
              ]}
              accessibilityLabel={`Select ${value} theme`}
            >
              <Icon size={18} color={active ? theme.accent : theme.textTertiary} />
              <Text style={[styles.themeOptionText, { color: active ? theme.accent : theme.textSecondary }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.accent }]} onPress={onStart} accessibilityLabel="Get started">
        <Text style={[styles.startBtnText, { color: isDark ? '#0F1115' : '#FFF' }]}>Get Started</Text>
        <ArrowRight size={18} color={isDark ? '#0F1115' : '#FFF'} />
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

  const handleStart = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
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

  const renderSlide = ({ index }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={{ width }}>
      {index === 0 && <Slide1 theme={theme} />}
      {index === 1 && <Slide2 theme={theme} />}
      {index === 2 && <Slide3 theme={theme} onStart={handleStart} isDark={isDark} />}
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

      {/* Progress indicator */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? theme.accent : theme.border,
                  width: i === currentIndex ? 24 : 6,
                },
              ]}
            />
          ))}
        </View>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleNext} style={[styles.nextBtn, { backgroundColor: theme.surface2 }]} accessibilityLabel="Next">
            <ArrowRight size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  slide: { width, flex: 1, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center', gap: 20 },
  brandMark: {
    width: 80, height: 80, borderRadius: 20, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  brandLetter: { fontFamily: Typography.fontFamily.heading, fontSize: 40 },
  slideDisplay: { fontFamily: Typography.fontFamily.heading, fontSize: 36, textAlign: 'center' },
  divider: { width: 32, height: 2, borderRadius: 1 },
  slideTitle: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h1, textAlign: 'center', lineHeight: 30 },
  slideDesc: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  categoriesRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  categoryItem: { alignItems: 'center', gap: 8 },
  categoryCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryLabel: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.caption },
  themeOptions: { width: '100%', gap: 10, marginTop: 8 },
  themeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: BorderRadius.md, borderWidth: 1.5,
  },
  themeOptionText: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, paddingHorizontal: 32, paddingVertical: 14, borderRadius: BorderRadius.full,
  },
  startBtnText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body, color: '#FFF' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 32, paddingBottom: 20,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  nextBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
