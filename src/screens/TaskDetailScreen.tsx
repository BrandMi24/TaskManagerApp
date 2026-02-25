/**
 * TaskDetailScreen.tsx — Full-screen task detail view.
 *
 * Shows all task metadata with edit / delete actions.
 * Reuses the CreateTaskScreen in edit mode via navigation.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedCheckbox from '../components/AnimatedCheckbox';
import { useTasks } from '../hooks/useTasks';
import { useTheme } from '../hooks/useTheme';
import { formatDate, priorityColor } from '../utils/helpers';
import type { Task } from '../types/task.types';

type RootStackParamList = {
  Home: undefined;
  CreateTask: { task?: Task } | undefined;
  TaskDetail: { task: Task };
};

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { task } = route.params;
  const { toggleTask, deleteTask, tasks } = useTasks();
  const { theme } = useTheme();

  // Get fresh task data in case it was toggled
  const currentTask = tasks.find((t) => t.id === task.id) ?? task;

  const pColorKey = priorityColor(currentTask.priority) as keyof typeof theme.colors;
  const pColor = theme.colors[pColorKey];

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(currentTask.id);
          navigation.goBack();
        },
      },
    ]);
  }, [currentTask.id, deleteTask, navigation]);

  const handleEdit = useCallback(() => {
    navigation.navigate('CreateTask', { task: currentTask });
  }, [currentTask, navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
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
        <Text style={styles.headerTitle} numberOfLines={2}>
          {currentTask.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: pColor + '30' }]}>
          <View style={[styles.badgeDot, { backgroundColor: pColor }]} />
          <Text style={[styles.badgeText, { color: '#fff' }]}>
            {currentTask.priority.charAt(0).toUpperCase() +
              currentTask.priority.slice(1)}{' '}
            Priority
          </Text>
        </View>
      </LinearGradient>

      {/* ── Detail Card ── */}
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
        {/* Status row */}
        <View style={styles.statusRow}>
          <AnimatedCheckbox
            checked={currentTask.completed}
            onToggle={() => toggleTask(currentTask.id)}
            size={28}
          />
          <Text
            style={[
              styles.statusLabel,
              {
                color: currentTask.completed
                  ? theme.colors.success
                  : theme.colors.textSecondary,
              },
            ]}
          >
            {currentTask.completed ? 'Completed' : 'In Progress'}
          </Text>
        </View>

        {/* Description */}
        {currentTask.description ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Description
            </Text>
            <Text style={[styles.descText, { color: theme.colors.text }]}>
              {currentTask.description}
            </Text>
          </>
        ) : null}

        {/* Meta info */}
        <View style={styles.metaGrid}>
          <MetaItem
            label="Due Date"
            value={formatDate(currentTask.dueDate)}
            theme={theme}
          />
          <MetaItem
            label="Created"
            value={formatDate(currentTask.createdAt)}
            theme={theme}
          />
          <MetaItem
            label="Updated"
            value={formatDate(currentTask.updatedAt)}
            theme={theme}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.colors.primary + '15',
                borderColor: theme.colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.colors.danger + '15',
                borderColor: theme.colors.danger,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.actionText, { color: theme.colors.danger }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </MotiView>
    </ScrollView>
  );
};

// ── Small helper sub-component ──
const MetaItem: React.FC<{
  label: string;
  value: string;
  theme: ReturnType<typeof import('../hooks/useTheme').useTheme>['theme'];
}> = ({ label, value, theme }) => (
  <View style={metaStyles.item}>
    <Text style={[metaStyles.label, { color: theme.colors.textSecondary }]}>
      {label}
    </Text>
    <Text style={[metaStyles.value, { color: theme.colors.text }]}>
      {value}
    </Text>
  </View>
);

const metaStyles = StyleSheet.create({
  item: { marginTop: 16 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 16, marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  back: { marginBottom: 16 },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#fff' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  card: {
    marginTop: -16,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 24,
  },
  descText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  metaGrid: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default TaskDetailScreen;
