import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { MediaItem } from "../../types/media";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { CategoryBadge } from "./CategoryBadge";
import { StarRating } from "../ui/StarRating";

interface MediaRowProps {
  item: MediaItem;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MediaRow({ item, onPress, onLongPress, style }: MediaRowProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      style={[styles.row, { borderBottomColor: theme.border }, style]}
    >
      <Image
        source={{ uri: item.coverUrl || undefined }}
        style={styles.cover}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <CategoryBadge type={item.type} />
        </View>
        <Text
          style={[styles.subtitle, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.subtitle}
        </Text>
        <View style={styles.bottomRow}>
          <StarRating rating={item.rating} size={13} />
          {item.year && (
            <Text style={[styles.year, { color: theme.textTertiary }]}>
              {item.year}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  cover: {
    width: 52,
    height: 72,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#2E2C2A",
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.body,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  year: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
  },
});
