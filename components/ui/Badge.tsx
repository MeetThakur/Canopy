import React from 'react';
import { View, Text, StyleSheet, ViewProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';

export interface BadgeProps extends ViewProps {
  label: string;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Badge({ label, color, textColor, style, labelStyle, ...props }: BadgeProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const backgroundColor = color || theme.surface2;
  const labelColor = textColor || theme.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor }, style]} {...props}>
      <Text style={[styles.label, { color: labelColor }, labelStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
