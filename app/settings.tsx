import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sun, Moon, Monitor, Download, Trash2, Info } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useTheme, useThemeStore } from '../hooks/useTheme';
import { Typography } from '../constants/typography';
import { BorderRadius, Spacing } from '../constants/spacing';
import { useLibraryStore } from '../stores/libraryStore';
import { Card } from '../components/ui/Card';

function SettingRow({ label, onPress, right, destructive }: {
  label: string; onPress?: () => void; right?: React.ReactNode; destructive?: boolean;
}) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.settingRow, { borderBottomColor: theme.border }]} disabled={!onPress} accessibilityLabel={label}>
      <Text style={[styles.settingLabel, { color: destructive ? theme.destructive : theme.textPrimary }]}>{label}</Text>
      {right}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeStore();
  const items = useLibraryStore((s) => s.items);
  const removeItem = useLibraryStore((s) => s.removeItem);

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your library data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Everything', style: 'destructive', onPress: () => {
        Object.keys(items).forEach((id) => removeItem(id));
      }},
    ]);
  };

  const THEME_OPTIONS: { label: string; value: 'light' | 'dark' | 'system'; Icon: typeof Sun }[] = [
    { label: 'Light', value: 'light', Icon: Sun },
    { label: 'Dark', value: 'dark', Icon: Moon },
    { label: 'System', value: 'system', Icon: Monitor },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Appearance</Text>
        <Card style={[styles.card, { borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Theme</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(({ label, value, Icon }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setThemeMode(value)}
                style={[styles.themeBtn, { backgroundColor: themeMode === value ? theme.accent : theme.surface2 }]}
                accessibilityLabel={`Set theme to ${label}`}
              >
                <Icon size={16} color={themeMode === value ? '#FFF' : theme.textSecondary} />
                <Text style={[styles.themeBtnText, { color: themeMode === value ? '#FFF' : theme.textSecondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Data</Text>
        <Card style={[styles.card, { borderColor: theme.border }]}>
          <SettingRow label="Export Library as JSON" onPress={() => Alert.alert('Export', 'Implement file system export here.')} right={<Download size={18} color={theme.textTertiary} />} />
          <SettingRow label="Clear All Data" onPress={handleClearAll} destructive right={<Trash2 size={18} color={theme.destructive} />} />
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>About</Text>
        <Card style={[styles.card, { borderColor: theme.border }]}>
          <SettingRow label="Kanopi v1.0.0" right={<Info size={18} color={theme.textTertiary} />} />
          <SettingRow label='Track what you love.' />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontFamily: Typography.fontFamily.primaryBold, fontSize: Typography.sizes.h2 },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: 80, gap: Spacing.sm },
  sectionLabel: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.caption, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.md, marginBottom: Spacing.xs },
  card: { borderWidth: 1, overflow: 'hidden' },
  cardTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body, padding: Spacing.md, paddingBottom: Spacing.sm },
  themeRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingTop: 0 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  themeBtnText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLabel: { fontFamily: Typography.fontFamily.primary, fontSize: Typography.sizes.body },
});
