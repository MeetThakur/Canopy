import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLibraryStore } from '../../stores/libraryStore';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, Plus } from 'lucide-react-native';
import { Status } from '../../types/media';

function getActivityIcon(status: Status, color: string) {
  const size = 14;
  if (status === 'completed') return <CheckCircle size={size} color={color} />;
  if (status === 'inprogress') return <Clock size={size} color={color} />;
  return <Plus size={size} color={color} />;
}

function getActivityVerb(status: Status) {
  switch (status) {
    case 'completed': return 'Finished';
    case 'inprogress': return 'Started';
    case 'want': return 'Added';
  }
}

export function ActivityFeed() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const itemsMap = useLibraryStore((s) => s.items);
  const items = React.useMemo(() => {
    return Object.values(itemsMap).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [itemsMap]);
  const recent = items.slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Recent</Text>
      {recent.map((item, i) => (
        <View key={item.id} style={[styles.row, i < recent.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: theme.surface2 }]}>
            {getActivityIcon(item.status, theme.textTertiary)}
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.activityText, { color: theme.textPrimary }]} numberOfLines={1}>
              <Text style={{ fontFamily: Typography.fontFamily.primaryMedium }}>{getActivityVerb(item.status)}</Text>
              {'  '}
              {item.title}
            </Text>
            <Text style={[styles.time, { color: theme.textTertiary }]}>
              {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: { flex: 1 },
  activityText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.bodySmall,
  },
  time: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
    marginTop: 1,
  },
});
