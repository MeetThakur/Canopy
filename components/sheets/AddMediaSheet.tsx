import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Book, Film, Tv, Gamepad2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../../constants/colors";
import { useTheme } from "../../hooks/useTheme";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { useLibraryStore } from "../../stores/libraryStore";
import { MediaItem, MediaType, Status } from "../../types/media";
import { StarRating } from "../ui/StarRating";
import { Button } from "../ui/Button";

const baseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().default(""),
  coverUrl: z.string().default(""),
  type: z.enum(["book", "movie", "tv", "game"]),
  status: z.enum(["want", "inprogress", "completed"]),
  rating: z.number().min(0).max(5).default(0),
  notes: z.string().default(""),
  year: z.number().optional(),
  description: z.string().optional(),
  pages: z.number().optional(),
  pagesRead: z.number().optional(),
  runtime: z.number().optional(),
  seasons: z.number().optional(),
  episodesWatched: z.number().optional(),
  platform: z.string().optional(),
  hoursPlayed: z.number().optional(),
});

type FormData = z.infer<typeof baseSchema>;

const TYPES: { value: MediaType; label: string; Icon: typeof Book }[] = [
  { value: "book", label: "Book", Icon: Book },
  { value: "movie", label: "Movie", Icon: Film },
  { value: "tv", label: "TV", Icon: Tv },
  { value: "game", label: "Game", Icon: Gamepad2 },
];
const STATUSES: { value: Status; label: string }[] = [
  { value: "want", label: "Want" },
  { value: "inprogress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

interface AddMediaSheetProps {
  visible: boolean;
  onClose: () => void;
  prefill?: Partial<FormData>;
  prefillSourceId?: string;
  editId?: string;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: theme.textTertiary }]}>
        {label}
      </Text>
      {children}
      {error && (
        <Text style={[fieldStyles.error, { color: theme.destructive }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  error: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.caption,
  },
});

export function AddMediaSheet({
  visible,
  onClose,
  prefill,
  prefillSourceId,
  editId,
}: AddMediaSheetProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { addItem, updateItem, getItemById } = useLibraryStore();

  const existingItem = editId ? getItemById(editId) : undefined;

  const defaultValues: FormData = {
    title: existingItem?.title ?? prefill?.title ?? "",
    subtitle: existingItem?.subtitle ?? prefill?.subtitle ?? "",
    coverUrl: existingItem?.coverUrl ?? prefill?.coverUrl ?? "",
    type: existingItem?.type ?? prefill?.type ?? "book",
    status: existingItem?.status ?? prefill?.status ?? "want",
    rating: existingItem?.rating ?? prefill?.rating ?? 0,
    notes: existingItem?.notes ?? prefill?.notes ?? "",
    year: existingItem?.year ?? prefill?.year,
    description: existingItem?.description ?? prefill?.description,
    pages: existingItem?.pages ?? prefill?.pages,
    pagesRead: existingItem?.pagesRead,
    runtime: existingItem?.runtime ?? prefill?.runtime,
    seasons: existingItem?.seasons ?? prefill?.seasons,
    episodesWatched: existingItem?.episodesWatched,
    platform: existingItem?.platform ?? prefill?.platform,
    hoursPlayed: existingItem?.hoursPlayed,
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues,
    mode: "onChange",
  });

  const selectedType = watch("type");

  const onSubmit = (data: FormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date();
    if (editId && existingItem) {
      updateItem(editId, { ...data, updatedAt: now });
    } else {
      const newItem: MediaItem = {
        id: Math.random().toString(36).slice(2),
        ...data,
        startDate: null,
        endDate: null,
        createdAt: now,
        updatedAt: now,
        sourceId: prefillSourceId || "",
        genre: prefill?.genre || [],
        language: prefill?.language || "",
      };
      addItem(newItem);
    }
    onClose();
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.surface2,
      borderColor: theme.border,
      color: theme.textPrimary,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.modalContainer, { backgroundColor: theme.surface }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Handle bar */}
        <View style={styles.handleBar}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
              {editId ? "Edit Item" : "Add to Library"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close sheet"
            >
              <X size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Type picker */}
          <Field label="Category">
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <View style={styles.segRow}>
                  {TYPES.map(({ value: v, label, Icon }) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => onChange(v)}
                      style={[
                        styles.segBtn,
                        {
                          backgroundColor:
                            value === v ? theme.textPrimary : theme.surface2,
                        },
                      ]}
                      accessibilityLabel={`Select category ${label}`}
                    >
                      <Icon
                        size={14}
                        color={
                          value === v ? theme.background : theme.textTertiary
                        }
                      />
                      <Text
                        style={[
                          styles.segText,
                          {
                            color:
                              value === v
                                ? theme.background
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </Field>

          {/* Title */}
          <Field label="Title *" error={errors.title?.message}>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={inputStyle}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter title"
                  placeholderTextColor={theme.textTertiary}
                  accessibilityLabel="Media title input"
                />
              )}
            />
          </Field>

          {/* Subtitle */}
          <Field
            label={
              selectedType === "book"
                ? "Author"
                : selectedType === "movie"
                  ? "Director"
                  : "Studio / Developer"
            }
          >
            <Controller
              control={control}
              name="subtitle"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={inputStyle}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter author/director/studio"
                  placeholderTextColor={theme.textTertiary}
                />
              )}
            />
          </Field>

          {/* Cover URL */}
          <Field label="Cover Image URL">
            <Controller
              control={control}
              name="coverUrl"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={inputStyle}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="https://…"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                />
              )}
            />
          </Field>

          {/* Status */}
          <Field label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field: { value, onChange } }) => (
                <View style={styles.segRow}>
                  {STATUSES.map(({ value: v, label }) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => onChange(v)}
                      style={[
                        styles.segBtn,
                        {
                          backgroundColor:
                            value === v ? theme.textPrimary : theme.surface2,
                          flex: 1,
                        },
                      ]}
                      accessibilityLabel={`Set status ${label}`}
                    >
                      <Text
                        style={[
                          styles.segText,
                          {
                            color:
                              value === v
                                ? theme.background
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </Field>

          {/* Rating */}
          <Field label="Your Rating">
            <Controller
              control={control}
              name="rating"
              render={({ field: { value, onChange } }) => (
                <StarRating
                  rating={value}
                  size={28}
                  editable
                  onRate={onChange}
                />
              )}
            />
          </Field>

          {/* Year */}
          <Field label="Year">
            <Controller
              control={control}
              name="year"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={inputStyle}
                  value={value?.toString() ?? ""}
                  onChangeText={(t) =>
                    onChange(t ? parseInt(t, 10) : undefined)
                  }
                  placeholder="e.g. 2024"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="numeric"
                />
              )}
            />
          </Field>

          {/* Type-specific fields */}
          {selectedType === "book" && (
            <>
              <Field label="Total Pages">
                <Controller
                  control={control}
                  name="pages"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={inputStyle}
                      value={value?.toString() ?? ""}
                      onChangeText={(t) =>
                        onChange(t ? parseInt(t, 10) : undefined)
                      }
                      placeholder="e.g. 320"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="numeric"
                    />
                  )}
                />
              </Field>
              <Field label="Pages Read">
                <Controller
                  control={control}
                  name="pagesRead"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={inputStyle}
                      value={value?.toString() ?? ""}
                      onChangeText={(t) =>
                        onChange(t ? parseInt(t, 10) : undefined)
                      }
                      placeholder="e.g. 150"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="numeric"
                    />
                  )}
                />
              </Field>
            </>
          )}
          {selectedType === "movie" && (
            <Field label="Runtime (minutes)">
              <Controller
                control={control}
                name="runtime"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={inputStyle}
                    value={value?.toString() ?? ""}
                    onChangeText={(t) =>
                      onChange(t ? parseInt(t, 10) : undefined)
                    }
                    placeholder="e.g. 148"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="numeric"
                  />
                )}
              />
            </Field>
          )}
          {selectedType === "tv" && (
            <>
              <Field label="Seasons">
                <Controller
                  control={control}
                  name="seasons"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={inputStyle}
                      value={value?.toString() ?? ""}
                      onChangeText={(t) =>
                        onChange(t ? parseInt(t, 10) : undefined)
                      }
                      placeholder="e.g. 3"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="numeric"
                    />
                  )}
                />
              </Field>
              <Field label="Episodes Watched">
                <Controller
                  control={control}
                  name="episodesWatched"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={inputStyle}
                      value={value?.toString() ?? ""}
                      onChangeText={(t) =>
                        onChange(t ? parseInt(t, 10) : undefined)
                      }
                      placeholder="e.g. 24"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="numeric"
                    />
                  )}
                />
              </Field>
            </>
          )}
          {selectedType === "game" && (
            <>
              <Field label="Platform">
                <Controller
                  control={control}
                  name="platform"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={inputStyle}
                      value={value ?? ""}
                      onChangeText={onChange}
                      placeholder="e.g. PC, PS5, Switch"
                      placeholderTextColor={theme.textTertiary}
                    />
                  )}
                />
              </Field>
              <Field label="Hours Played">
                <Controller
                  control={control}
                  name="hoursPlayed"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={inputStyle}
                      value={value?.toString() ?? ""}
                      onChangeText={(t) =>
                        onChange(t ? parseInt(t, 10) : undefined)
                      }
                      placeholder="e.g. 45"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="numeric"
                    />
                  )}
                />
              </Field>
            </>
          )}

          {/* Notes */}
          <Field label="Notes">
            <Controller
              control={control}
              name="notes"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[inputStyle, styles.notesInput]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Your thoughts…"
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  accessibilityLabel="Notes input"
                />
              )}
            />
          </Field>

          <Button
            title={editId ? "Save Changes" : "Add to Library"}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            style={styles.submitBtn}
            accessibilityLabel={editId ? "Save changes" : "Add to library"}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  handleBar: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handle: { width: 36, height: 5, borderRadius: 3 },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 60 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sheetTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.h2,
  },
  segRow: { flexDirection: "row", gap: Spacing.sm },
  segBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  segText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.sizes.caption,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    height: 44,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.sizes.body,
  },
  notesInput: { height: 100 },
  submitBtn: { marginTop: Spacing.sm },
});
