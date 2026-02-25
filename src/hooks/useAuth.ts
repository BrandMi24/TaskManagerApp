/**
 * useAuth.ts — Convenience hook for consuming AuthContext.
 *
 * Components never import the context directly; they use this
 * hook which also provides a guardrail if used outside the provider.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
