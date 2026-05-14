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
import { Card } from "../ui/Card";
import { MediaItem } from "../../types/media";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { CategoryBadge } from "./CategoryBadge";
import { StatusPill } from "./StatusPill";

interface MediaCardProps {
  item: MediaItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MediaCard({ item, onPress, style }: MediaCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={style}>
      <Card style={styles.card}>
        <Image
          source={{ uri: item.coverUrl }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.title, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          <Text
            style={[styles.subtitle, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.subtitle}
          </Text>
          <View style={styles.badgeRow}>
            <CategoryBadge type={item.type} />
          </View>
          <View style={styles.footer}>
            <StatusPill status={item.status} />
            {item.year && (
              <Text style={[styles.year, { color: theme.textTertiary }]}>
                {item.year}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    height: 180,
    flexDirection: "row",
  },
  cover: {
    width: 120,
    height: "100%",
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.sizes.body,
    width: "100%",
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },
  badgeRow: {
    marginTop: Spacing.xs,
    alignItems: "flex-start",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  year: {
    fontFamily: Typography.fontFamily.primaryMedium,
    fontSize: Typography.sizes.caption,
  },
});
