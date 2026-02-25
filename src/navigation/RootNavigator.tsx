/**
 * RootNavigator.tsx — Top-level navigation orchestrator.
 *
 * Routes:
 *   Unauthenticated → Auth stack (Login / Register)
 *   Authenticated   → App stack  (Home / CreateTask / TaskDetail)
 *
 * Wraps the authenticated branch in TaskProvider so tasks are
 * scoped to the current user.
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { TaskProvider } from '../context/TaskContext';
import type { Task } from '../types/task.types';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';

// ─── Param lists ───────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CreateTask: { task?: Task } | undefined;
  TaskDetail: { task: Task };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// ─── Auth Navigator ────────────────────────────────────────────
const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// ─── App Navigator (authenticated) ────────────────────────────
const AppNavigator: React.FC = () => (
  <AppStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <AppStack.Screen name="Home" component={HomeScreen} />
    <AppStack.Screen name="CreateTask" component={CreateTaskScreen} />
    <AppStack.Screen name="TaskDetail" component={TaskDetailScreen} />
  </AppStack.Navigator>
);

// ─── Root ──────────────────────────────────────────────────────
const RootNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme, isDark } = useTheme();

  /** Build React Navigation theme from our tokens. */
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };

  if (isLoading) {
    return (
      <View
        style={[styles.splash, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated && user ? (
        <TaskProvider userId={user.id}>
          <AppNavigator />
        </TaskProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;
