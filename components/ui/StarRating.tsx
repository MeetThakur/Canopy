import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Animated } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRate?: (rating: number) => void;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
}

function AnimatedStar({
  filled,
  half,
  size,
  color,
  inactiveColor,
  onPress,
  editable,
}: {
  filled: boolean;
  half: boolean;
  size: number;
  color: string;
  inactiveColor: string;
  onPress: () => void;
  editable: boolean;
}) {
  const scale = useRef(new Animated.Value(filled || half ? 1.0 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: filled || half ? 1.0 : 0.9,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  }, [filled, half]);

  return (
    <TouchableOpacity
      onPress={editable ? onPress : undefined}
      disabled={!editable}
      accessibilityLabel={`Rate ${filled ? 'filled' : 'empty'} star`}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Star
          size={size}
          color={filled || half ? color : inactiveColor}
          fill={filled ? color : half ? color : 'transparent'}
          strokeWidth={1.5}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  onRate,
  editable = false,
  style,
}: StarRatingProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const starColor = theme.accent;
  const inactiveColor = theme.border;

  const handleRate = (index: number) => {
    if (onRate) {
      // Allow toggling half stars: if tapping on same full star, set to half
      const newRating = index + 1;
      if (newRating === rating) {
        onRate(newRating - 0.5);
      } else if (newRating - 0.5 === rating) {
        onRate(0);
      } else {
        onRate(newRating);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i + 1 <= rating;
        const half = !filled && i + 0.5 <= rating;
        return (
          <AnimatedStar
            key={i}
            filled={filled}
            half={half}
            size={size}
            color={starColor}
            inactiveColor={inactiveColor}
            onPress={() => handleRate(i)}
            editable={editable}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
});
