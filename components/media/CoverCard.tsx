import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { MediaItem } from "../../types/media";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { CategoryBadge } from "./CategoryBadge";

interface CoverCardProps {
  item: MediaItem;
  onPress: () => void;
}

export function CoverCard({ item, onPress }: CoverCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={item.title}
    >
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: item.coverUrl || undefined }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.iconOverlay}>
          <CategoryBadge type={item.type} size={14} />
        </View>
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: theme.textPrimary }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: Spacing.md,
  },
  coverContainer: {
    height: 180,
    width: "100%",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: "#2E2C2A",
    marginBottom: Spacing.xs,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  iconOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BorderRadius.sm,
    padding: 4,
  },
  info: {
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: 12,
  },
});
