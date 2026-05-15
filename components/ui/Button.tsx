import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const getBackgroundColor = () => {
    if (disabled) return theme.surface2;
    switch (variant) {
      case 'primary': return theme.accent;
      case 'secondary': return theme.surface2;
      case 'outline': return 'transparent';
      case 'destructive': return theme.destructive;
      default: return theme.accent;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textTertiary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return theme.textPrimary;
      case 'outline': return theme.textPrimary;
      case 'destructive': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.border;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    height: 32,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 44,
  },
  lg: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 54,
  },
});
