/**
 * TaskCard.tsx — Swipeable task card with Moti entrance animations.
 *
 * Features:
 * - Animated fade + slide entrance via Moti
 * - Swipe-to-delete via react-native-gesture-handler
 * - Reanimated-powered animated checkbox
 * - Priority colour indicator
 * - Soft shadow + 16px border radius (design system)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { MotiView } from 'moti';
import {
  Swipeable,
} from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AnimatedCheckbox from './AnimatedCheckbox';
import { useTheme } from '../hooks/useTheme';
import { formatDate, priorityColor } from '../utils/helpers';
import type { Task } from '../types/task.types';

interface Props {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onPress: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<Props> = ({
  task,
  index,
  onToggle,
  onPress,
  onDelete,
}) => {
  const { theme } = useTheme();
  const swipeableRef = React.useRef<Swipeable>(null);

  /** Map priority to theme colour. */
  const pColor =
    theme.colors[priorityColor(task.priority) as keyof typeof theme.colors];

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(task.id),
      },
    ]);
  };

  /** Render the red delete action behind the card. */
  const renderRightActions = () => (
    <Pressable onPress={handleDelete} style={styles.deleteAction}>
      <Animated.View
        entering={FadeIn}
        style={[
          styles.deleteBg,
          { backgroundColor: theme.colors.danger },
        ]}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>
    </Pressable>
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 80 }}
    >
      <Animated.View layout={Layout.springify()} exiting={FadeOut}>
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
        >
          <Pressable onPress={() => onPress(task)}>
            <View
              style={[
                styles.card,
                theme.shadow,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Priority indicator strip */}
              <View
                style={[styles.priorityStrip, { backgroundColor: pColor }]}
              />

              {/* Checkbox */}
              <AnimatedCheckbox
                checked={task.completed}
                onToggle={() => onToggle(task.id)}
              />

              {/* Content */}
              <View style={styles.content}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: task.completed
                        ? theme.colors.textSecondary
                        : theme.colors.text,
                      textDecorationLine: task.completed
                        ? 'line-through'
                        : 'none',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                <Text
                  style={[
                    styles.meta,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {formatDate(task.dueDate)} · {task.priority}
                </Text>
              </View>
            </View>
          </Pressable>
        </Swipeable>
      </Animated.View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  priorityStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    marginTop: 4,
  },
  deleteAction: {
    justifyContent: 'center',
    marginBottom: 12,
    marginLeft: 8,
  },
  deleteBg: {
    borderRadius: 16,
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default TaskCard;
