import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Book, Film, Tv, Gamepad2 } from "lucide-react-native";
import { MediaType } from "../../types/media";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";

interface CategoryBadgeProps {
  type: MediaType;
  style?: StyleProp<ViewStyle>;
  size?: number;
}

export function CategoryBadge({ type, style, size = 16 }: CategoryBadgeProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const getIcon = () => {
    switch (type) {
      case "book":
        return <Book size={size} color={theme.accentBooks} />;
      case "movie":
        return <Film size={size} color={theme.accentMovies} />;
      case "tv":
        return <Tv size={size} color={theme.accentTV} />;
      case "game":
        return <Gamepad2 size={size} color={theme.accentGames} />;
      default:
        return null;
    }
  };

  return <View style={style}>{getIcon()}</View>;
}
