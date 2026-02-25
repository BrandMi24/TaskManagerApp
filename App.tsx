/**
 * App.tsx — Application root.
 *
 * Wraps the entire tree with:
 *   1. GestureHandlerRootView  (gesture-handler requirement)
 *   2. ThemeProvider            (dark / light mode)
 *   3. AuthProvider             (session & auth actions)
 *   4. RootNavigator            (conditional auth / app stacks)
 *
 * StatusBar style adapts to the active theme.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
