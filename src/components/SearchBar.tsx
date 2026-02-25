/**
 * SearchBar.tsx — Glassmorphic search input powered by expo-blur.
 *
 * The blur intensity adapts to the current theme.
 */

import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = 'Search tasks…',
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.wrapper, { borderColor: theme.colors.border }]}>
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blur}
      >
        <View style={styles.inner}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blur: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});

export default SearchBar;
