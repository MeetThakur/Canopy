import React from 'react';
import { Badge } from '../ui/Badge';
import { Status } from '../../types/media';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { StyleProp, ViewStyle } from 'react-native';

interface StatusPillProps {
  status: Status;
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ status, style }: StatusPillProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const getStatusLabel = () => {
    switch (status) {
      case 'want': return 'Want to Read/Watch/Play';
      case 'inprogress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'want': return theme.surface2;
      case 'inprogress': return theme.textSecondary;
      case 'completed': return theme.success;
      default: return theme.surface2;
    }
  };

  const getTextColor = () => {
    if (status === 'want') return theme.textPrimary;
    if (status === 'completed') return '#FFFFFF';
    return '#FFFFFF';
  };

  return (
    <Badge
      label={getStatusLabel()}
      color={getStatusColor()}
      textColor={getTextColor()}
      style={style}
    />
  );
}
