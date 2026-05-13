import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius } from '../../constants/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = BorderRadius.sm, style }: SkeletonProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: isDark ? '#2E2C2A' : '#E8E4DF',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function MediaCardSkeleton() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[skeletonStyles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <SkeletonLoader width={120} height={180} borderRadius={0} />
      <View style={skeletonStyles.content}>
        <SkeletonLoader width="90%" height={14} />
        <SkeletonLoader width="60%" height={12} style={{ marginTop: 8 }} />
        <SkeletonLoader width={60} height={24} borderRadius={BorderRadius.full} style={{ marginTop: 'auto' }} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    width: 250,
    height: 180,
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
});
