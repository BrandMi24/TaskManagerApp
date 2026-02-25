/**
 * AnimatedCheckbox.tsx — Reanimated-powered checkbox with haptic feedback.
 *
 * When toggled, the box scales up, fills with colour, and displays
 * a checkmark with a spring animation. Haptic feedback fires on complete.
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';

interface Props {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

const AnimatedCheckbox: React.FC<Props> = ({
  checked,
  onToggle,
  size = 26,
}) => {
  const { theme } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, {
      damping: 15,
      stiffness: 180,
    });
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', theme.colors.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary],
    ),
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: withTiming(checked ? 1 : 0, { duration: 200 }),
    transform: [{ scale: progress.value }],
  }));

  const handlePress = () => {
    // Scale bounce
    scale.value = withSpring(0.85, { damping: 4, stiffness: 300 }, () => {
      scale.value = withSpring(1);
    });
    if (!checked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View
        style={[
          styles.box,
          { width: size, height: size, borderRadius: size * 0.3 },
          boxStyle,
        ]}
      >
        <Animated.Text
          style={[styles.check, { fontSize: size * 0.6 }, checkStyle]}
        >
          ✓
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default AnimatedCheckbox;
