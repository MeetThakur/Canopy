import React from 'react';
import { Badge } from '../ui/Badge';
import { MediaType } from '../../types/media';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { StyleProp, ViewStyle } from 'react-native';

interface CategoryBadgeProps {
  type: MediaType;
  style?: StyleProp<ViewStyle>;
}

export function CategoryBadge({ type, style }: CategoryBadgeProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const getCategoryLabel = () => {
    switch (type) {
      case 'book': return 'Book';
      case 'movie': return 'Movie';
      case 'tv': return 'TV Show';
      case 'game': return 'Game';
      default: return '';
    }
  };

  const getCategoryColor = () => {
    switch (type) {
      case 'book': return theme.accentBooks;
      case 'movie': return theme.accentMovies;
      case 'tv': return theme.accentTV;
      case 'game': return theme.accentGames;
      default: return theme.surface2;
    }
  };

  return (
    <Badge
      label={getCategoryLabel()}
      color={getCategoryColor()}
      textColor="#FFFFFF"
      style={style}
    />
  );
}
