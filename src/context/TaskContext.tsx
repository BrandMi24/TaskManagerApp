/**
 * TaskContext.tsx — Global task state management.
 *
 * Manages the full task lifecycle (CRUD), search, filtering,
 * and persistence to AsyncStorage scoped per user.
 */

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilter,
} from '../types/task.types';
import { StorageService } from '../services/storage.service';
import { generateId } from '../utils/helpers';

// ─── Context shape ─────────────────────────────────────────────
interface TaskContextValue {
  tasks: Task[];
  filteredTasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
  isLoading: boolean;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  allCompleted: boolean;
  setFilter: (f: TaskFilter) => void;
  setSearchQuery: (q: string) => void;
  addTask: (payload: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const TaskContext = createContext<TaskContextValue>({
  tasks: [],
  filteredTasks: [],
  filter: 'all',
  searchQuery: '',
  isLoading: true,
  totalTasks: 0,
  completedTasks: 0,
  completionRate: 0,
  allCompleted: false,
  setFilter: () => {},
  setSearchQuery: () => {},
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  toggleTask: async () => {},
  refreshTasks: async () => {},
});

// ─── Provider ──────────────────────────────────────────────────

interface Props {
  userId: string;
  children: ReactNode;
}

export const TaskProvider: React.FC<Props> = ({ userId, children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  /** Persist current tasks list. */
  const persist = useCallback(
    async (updated: Task[]) => {
      setTasks(updated);
      await StorageService.saveTasks(userId, updated);
    },
    [userId],
  );

  /** Load tasks from storage. */
  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    const stored = await StorageService.getTasks(userId);
    setTasks(stored);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // ── CRUD ──

  const addTask = useCallback(
    async (payload: CreateTaskPayload) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: generateId(),
        userId,
        title: payload.title.trim(),
        description: payload.description.trim(),
        priority: payload.priority,
        dueDate: payload.dueDate,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      await persist([task, ...tasks]);
    },
    [tasks, persist, userId],
  );

  const updateTask = useCallback(
    async (id: string, payload: UpdateTaskPayload) => {
      const updated = tasks.map((t) =>
        t.id === id
          ? { ...t, ...payload, updatedAt: new Date().toISOString() }
          : t,
      );
      await persist(updated);
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await persist(tasks.filter((t) => t.id !== id));
    },
    [tasks, persist],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const updated = tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t,
      );
      await persist(updated);
    },
    [tasks, persist],
  );

  // ── Derived state ──

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const allCompleted = totalTasks > 0 && completedTasks === totalTasks;

  /** Apply filter + search. */
  const filteredTasks = useMemo(() => {
    let result = tasks;

    switch (filter) {
      case 'completed':
        result = result.filter((t) => t.completed);
        break;
      case 'pending':
        result = result.filter((t) => !t.completed);
        break;
      case 'high':
        result = result.filter((t) => t.priority === 'high');
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [tasks, filter, searchQuery]);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      filteredTasks,
      filter,
      searchQuery,
      isLoading,
      totalTasks,
      completedTasks,
      completionRate,
      allCompleted,
      setFilter,
      setSearchQuery,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      refreshTasks,
    }),
    [
      tasks,
      filteredTasks,
      filter,
      searchQuery,
      isLoading,
      totalTasks,
      completedTasks,
      completionRate,
      allCompleted,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      refreshTasks,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
