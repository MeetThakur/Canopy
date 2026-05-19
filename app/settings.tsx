import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sun, Moon, Monitor, Download, Trash2, Info, Upload } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../constants/colors';
import { useTheme, useThemeStore } from '../hooks/useTheme';
import { Typography } from '../constants/typography';
import { BorderRadius, Spacing } from '../constants/spacing';
import { useLibraryStore } from '../stores/libraryStore';
import { useStatsStore } from '../stores/statsStore';
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
  const importData = useLibraryStore((s) => s.importData);
  const { recalculateStats } = useStatsStore();

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your library data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Everything', style: 'destructive', onPress: () => {
        Object.keys(items).forEach((id) => removeItem(id));
      }},
    ]);
  };

  const handleExport = async () => {
    try {
      const state = useLibraryStore.getState();
      const data = JSON.stringify({ items: state.items, order: state.order }, null, 2);
      
      const fileUri = FileSystem.cacheDirectory + 'canopy_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (Platform.OS === 'android') {
        try {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const fileUriSaf = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, 'canopy_backup', 'application/json');
            await FileSystem.writeAsStringAsync(fileUriSaf, data, { encoding: FileSystem.EncodingType.UTF8 });
            Alert.alert("Success", "Library exported successfully via Storage Access Framework.");
            return;
          } else {
            console.warn("StorageAccessFramework permission denied, falling back to share dialog.");
          }
        } catch (safError: any) {
          console.warn("SAF export failed, falling back to Sharing API:", safError);
        }
      }
      
      // Fallback or iOS default
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { 
          UTI: 'public.json', 
          mimeType: 'application/json',
          dialogTitle: 'Export Canopy Backup'
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (e: any) {
      Alert.alert("Export Failed", `Could not export your library data: ${e?.message || e}`);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;
      const fileUri = result.assets[0].uri;
      const fileData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const parsed = JSON.parse(fileData);
      
      if (parsed && typeof parsed === 'object' && parsed.items) {
        importData(parsed.items, parsed.order || []);
        recalculateStats();
        Alert.alert("Success", "Library data restored successfully!");
      } else {
        Alert.alert("Invalid File", "The selected file does not contain valid Canopy backup data.");
      }
    } catch (e: any) {
      Alert.alert("Import Failed", `Could not read the backup file: ${e?.message || e}`);
    }
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
          <SettingRow label="Export Backup (JSON)" onPress={handleExport} right={<Upload size={18} color={theme.textTertiary} />} />
          <SettingRow label="Import Backup (JSON)" onPress={handleImport} right={<Download size={18} color={theme.textTertiary} />} />
          <SettingRow label="Clear All Data" onPress={handleClearAll} destructive right={<Trash2 size={18} color={theme.destructive} />} />
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>About</Text>
        <Card style={[styles.card, { borderColor: theme.border }]}>
          <SettingRow label="Canopy v1.0.0" right={<Info size={18} color={theme.textTertiary} />} />
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
  card: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  cardTitle: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.body, padding: Spacing.md, paddingBottom: Spacing.sm },
  themeRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingTop: 0 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  themeBtnText: { fontFamily: Typography.fontFamily.primarySemiBold, fontSize: Typography.sizes.bodySmall },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLabel: { fontFamily: Typography.fontFamily.primaryMedium, fontSize: Typography.sizes.body },
});
