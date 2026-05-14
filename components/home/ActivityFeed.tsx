import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLibraryStore } from '../../stores/libraryStore';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { formatDistanceToNow } from 'date-fns';
import { Book, Film, Tv, Gamepad2, CheckCircle, Clock } from 'lucide-react-native';
import { MediaType, Status } from '../../types/media';

function getActivityIcon(type: MediaType, status: Status, iconColor: string) {
  const size = 16;
  if (status === 'completed') return <CheckCircle size={size} color={iconColor} />;
  if (status === 'inprogress') return <Clock size={size} color={iconColor} />;
  switch (type) {
    case 'book': return <Book size={size} color={iconColor} />;
    case 'movie': return <Film size={size} color={iconColor} />;
    case 'tv': return <Tv size={size} color={iconColor} />;
    case 'game': return <Gamepad2 size={size} color={iconColor} />;
  }
}

function getActivityText(status: Status) {
  switch (status) {
    case 'completed': return 'Completed';
    case 'inprogress': return 'Started';
    case 'want': return 'Added to Wishlist';
  }
}

export function ActivityFeed() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const itemsMap = useLibraryStore((s) => s.items);
  const items = React.useMemo(() => {
    return Object.values(itemsMap).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [itemsMap]);
  const recent = items.slice(0, 10);

  if (recent.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Recent Activity</Text>
      {recent.map((item) => {
        const accent =
          item.type === 'book' ? theme.accentBooks :
          item.type === 'movie' ? theme.accentMovies :
          item.type === 'tv' ? theme.accentTV :
          theme.accentGames;

        return (
          <View key={item.id} style={[styles.row, { borderBottomColor: theme.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: accent + '20' }]}>
              {getActivityIcon(item.type, item.status, accent)}
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.activityText, { color: theme.textPrimary }]} numberOfLines={1}>
                <Text style={{ fontFamily: Typography.fontFamily.primarySemiBold }}>
                  {getActivityText(item.status)}{' '}
                </Text>
                {item.title}
              </Text>
              <Text style={[styles.time, { color: theme.textTertiary }]}>
                {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
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
    marginTop: 2,
  },
});
