import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { Spacing, BorderRadius } from "../../constants/spacing";
import { GripVertical } from "lucide-react-native";
import { MediaItem } from "../../types/media";
import { MediaRow } from "./MediaRow";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ITEM_HEIGHT = 88; // must match MediaRow height

interface DraggableListProps {
  data: MediaItem[];
  onReorder: (newData: MediaItem[]) => void;
  onPress: (item: MediaItem) => void;
}

export function DraggableList({ data, onReorder, onPress }: DraggableListProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dragY = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);
  const currentIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const makePanResponder = useCallback(
    (index: number) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          dragStartY.current = 0;
          dragY.setValue(0);
          currentIndexRef.current = index;
          hoverIndexRef.current = index;
          setDraggingIndex(index);
          setHoverIndex(index);
        },

        onPanResponderMove: (_, gs) => {
          dragY.setValue(gs.dy);
          const newIndex = Math.max(
            0,
            Math.min(
              dataRef.current.length - 1,
              index + Math.round(gs.dy / ITEM_HEIGHT)
            )
          );
          if (newIndex !== hoverIndexRef.current) {
            hoverIndexRef.current = newIndex;
            setHoverIndex(newIndex);
          }
        },

        onPanResponderRelease: (_, gs) => {
          const newIndex = Math.max(
            0,
            Math.min(
              dataRef.current.length - 1,
              index + Math.round(gs.dy / ITEM_HEIGHT)
            )
          );
          if (newIndex !== index) {
            const newData = [...dataRef.current];
            const [removed] = newData.splice(index, 1);
            newData.splice(newIndex, 0, removed);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            onReorder(newData);
          }
          dragY.setValue(0);
          setDraggingIndex(null);
          setHoverIndex(null);
          currentIndexRef.current = null;
          hoverIndexRef.current = null;
        },

        onPanResponderTerminate: () => {
          dragY.setValue(0);
          setDraggingIndex(null);
          setHoverIndex(null);
        },
      }),
    [onReorder]
  );

  return (
    <ScrollView
      scrollEnabled={draggingIndex === null}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {data.map((item, index) => {
        const isDragging = draggingIndex === index;
        const isHover = hoverIndex === index && draggingIndex !== null && draggingIndex !== index;

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.rowWrapper,
              {
                backgroundColor: isDragging
                  ? theme.surface2
                  : isHover
                  ? theme.accent + "10"
                  : theme.background,
                borderBottomColor: theme.border,
                transform: isDragging ? [{ translateY: dragY }] : [],
                zIndex: isDragging ? 10 : 1,
                elevation: isDragging ? 6 : 0,
                shadowColor: isDragging ? "#000" : "transparent",
                shadowOffset: { width: 0, height: isDragging ? 4 : 0 },
                shadowOpacity: isDragging ? 0.15 : 0,
                shadowRadius: isDragging ? 8 : 0,
              },
            ]}
          >
            <MediaRow
              item={item}
              onPress={() => !draggingIndex && onPress(item)}
              style={{ flex: 1 }}
            />
            <View
              {...makePanResponder(index).panHandlers}
              style={styles.handle}
              accessibilityLabel="Drag to reorder"
            >
              <GripVertical size={20} color={theme.textTertiary} />
            </View>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  handle: {
    width: 48,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
});
