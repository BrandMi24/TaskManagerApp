/**
 * useTasks.ts — Convenience hook for consuming TaskContext.
 */

import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return ctx;
};
