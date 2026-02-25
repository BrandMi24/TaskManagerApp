/**
 * HomeScreen.tsx — Main dashboard after authentication.
 *
 * Displays:
 * - Greeting with user name
 * - Summary stats (total / completed) + animated progress ring
 * - Filter chips (All / Completed / Pending / High Priority)
 * - Search bar (glassmorphic)
 * - Task list with swipe-to-delete cards
 * - Confetti overlay when all tasks completed
 * - Floating Action Button to create tasks
 * - Dark / light mode toggle
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useTheme } from '../hooks/useTheme';
import { getGreeting } from '../utils/helpers';
import TaskCard from '../components/TaskCard';
import SearchBar from '../components/SearchBar';
import FloatingButton from '../components/FloatingButton';
import ProgressRing from '../components/ProgressRing';
import type { Task, TaskFilter } from '../types/task.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'High Priority', value: 'high' },
];

type RootStackParamList = {
  Home: undefined;
  CreateTask: undefined;
  TaskDetail: { task: Task };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// ── Confetti particle ──────────────────────────────────────────
const ConfettiPiece: React.FC<{ index: number }> = ({ index }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(
    (Math.random() - 0.5) * SCREEN_WIDTH * 0.8,
  );
  const rotate = useSharedValue(0);
  const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#FD79A8', '#74B9FF'];

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(600, { duration: 2000 + Math.random() * 1000, easing: Easing.linear }),
      -1,
      false,
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [translateY, rotate]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -10,
          left: SCREEN_WIDTH / 2,
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: colors[index % colors.length],
        },
        style,
      ]}
    />
  );
};

// ── Main Component ─────────────────────────────────────────────
const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const {
    filteredTasks,
    filter,
    searchQuery,
    totalTasks,
    completedTasks,
    completionRate,
    allCompleted,
    setFilter,
    setSearchQuery,
    toggleTask,
    deleteTask,
  } = useTasks();
  const { theme, isDark, toggleTheme } = useTheme();

  const [showConfetti, setShowConfetti] = useState(false);
  const prevAllCompleted = useRef(false);

  /** Show confetti when transitioning to all-completed. */
  useEffect(() => {
    if (allCompleted && !prevAllCompleted.current && totalTasks > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
    prevAllCompleted.current = allCompleted;
  }, [allCompleted, totalTasks]);

  const handleTaskPress = useCallback(
    (task: Task) => navigation.navigate('TaskDetail', { task }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <TaskCard
        task={item}
        index={index}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onPress={handleTaskPress}
      />
    ),
    [toggleTask, deleteTask, handleTaskPress],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                {getGreeting()},{' '}
                <Text style={styles.greetingName}>{user?.name ?? 'User'}</Text>
              </Text>
              <Text style={styles.subGreeting}>
                {totalTasks === 0
                  ? 'No tasks yet — create one!'
                  : `${completedTasks} of ${totalTasks} tasks completed`}
              </Text>
            </View>
            <ProgressRing progress={completionRate} size={64} strokeWidth={5} />
          </View>

          {/* Action row */}
          <View style={styles.actionRow}>
            <Pressable onPress={toggleTheme} style={styles.themeBtn}>
              <Text style={styles.themeBtnText}>{isDark ? '☀️' : '🌙'}</Text>
            </Pressable>
            <Pressable onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
          </View>
        </MotiView>
      </LinearGradient>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* ── Filter Chips ── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: active
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#fff' : theme.colors.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Task List ── */}
      <FlatList
        data={filteredTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={FadeIn} style={styles.empty}>
            <Text style={[styles.emptyIcon]}>📋</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No matching tasks' : 'No tasks here yet'}
            </Text>
          </Animated.View>
        }
      />

      {/* ── FAB ── */}
      <FloatingButton onPress={() => navigation.navigate('CreateTask')} />

      {/* ── Confetti ── */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  greetingName: {
    fontWeight: '700',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnText: { fontSize: 18 },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchWrap: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
