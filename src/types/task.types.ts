/**
 * task.types.ts — Core domain types for the task system.
 *
 * Every task belongs to a user (via `userId`) and carries
 * metadata for priority, completion status, and timestamps.
 */

/** Allowed priority levels, ordered low → high. */
export type Priority = 'low' | 'medium' | 'high';

/** Filter presets used on the Home dashboard. */
export type TaskFilter = 'all' | 'completed' | 'pending' | 'high';

/** Core task entity persisted to AsyncStorage. */
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  dueDate: string; // ISO-8601 date string
  createdAt: string; // ISO-8601 timestamp
  updatedAt: string; // ISO-8601 timestamp
}

/** Payload used when creating a new task (id & timestamps are generated). */
export type CreateTaskPayload = Pick<
  Task,
  'title' | 'description' | 'priority' | 'dueDate'
>;

/** Payload used when editing — every field is optional. */
export type UpdateTaskPayload = Partial<
  Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'completed'>
>;
