/**
 * CreateTaskScreen.tsx — Create or edit a task.
 *
 * Supports both creation and editing modes. When a `task` route param
 * is present, the form pre-fills for editing.
 *
 * Features:
 * - Priority selector with colour indicators
 * - Due-date input
 * - Validation
 * - Gradient submit button
 * - Moti entrance animations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTasks } from '../hooks/useTasks';
import { useTheme } from '../hooks/useTheme';
import type { Priority, Task } from '../types/task.types';

type RootStackParamList = {
  Home: undefined;
  CreateTask: { task?: Task } | undefined;
  TaskDetail: { task: Task };
};

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTask'>;

const PRIORITIES: { label: string; value: Priority; color: string }[] = [
  { label: 'Low', value: 'low', color: '#00B894' },
  { label: 'Medium', value: 'medium', color: '#FDCB6E' },
  { label: 'High', value: 'high', color: '#FF6B6B' },
];

const CreateTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const existingTask = route.params && 'task' in route.params ? route.params.task : undefined;
  const isEditing = !!existingTask;

  const { addTask, updateTask } = useTasks();
  const { theme } = useTheme();

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(
    existingTask?.description ?? '',
  );
  const [priority, setPriority] = useState<Priority>(
    existingTask?.priority ?? 'medium',
  );
  const [dueDate, setDueDate] = useState(
    existingTask?.dueDate
      ? new Date(existingTask.dueDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isEditing && existingTask) {
      await updateTask(existingTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: new Date(dueDate).toISOString(),
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: new Date(dueDate).toISOString(),
      });
    }
    navigation.goBack();
  }, [
    title,
    description,
    priority,
    dueDate,
    isEditing,
    existingTask,
    addTask,
    updateTask,
    navigation,
  ]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { backgroundColor: theme.colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>
        </LinearGradient>

        {/* ── Form ── */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 150 }}
          style={[
            styles.card,
            theme.shadow,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Title */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Title
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.colors.placeholder}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Add some details…"
            placeholderTextColor={theme.colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Priority */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Priority
          </Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p.value;
              return (
                <Pressable
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: active
                        ? p.color + '20'
                        : theme.colors.inputBackground,
                      borderColor: active ? p.color : theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.priorityDot, { backgroundColor: p.color }]}
                  />
                  <Text
                    style={[
                      styles.priorityLabel,
                      {
                        color: active ? p.color : theme.colors.textSecondary,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Due Date */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Due Date
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.placeholder}
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numbers-and-punctuation"
          />

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Text>
            </LinearGradient>
          </Pressable>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  back: { marginBottom: 12 },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  card: {
    marginTop: -16,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1 },
  textArea: { minHeight: 100 },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityLabel: {
    fontSize: 14,
  },
  button: { marginTop: 28, borderRadius: 16, overflow: 'hidden' },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CreateTaskScreen;
