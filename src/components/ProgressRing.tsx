/**
 * ProgressRing.tsx — Animated circular progress indicator.
 *
 * Uses SVG-free approach with Reanimated rotating borders
 * to show task completion percentage. Renders two half-circles
 * that rotate based on the `progress` (0-1) value.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface Props {
  progress: number; // 0 → 1
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<Props> = ({
  progress,
  size = 100,
  strokeWidth = 8,
}) => {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const half = size / 2;
  const innerSize = size - strokeWidth * 2;

  // Right half (0 → 180°)
  const rightStyle = useAnimatedStyle(() => {
    const deg = Math.min(animatedProgress.value * 360, 180);
    return {
      transform: [{ rotateZ: `${deg}deg` }],
    };
  });

  // Left half (180° → 360°)
  const leftStyle = useAnimatedStyle(() => {
    const deg = Math.max((animatedProgress.value * 360 - 180), 0);
    return {
      transform: [{ rotateZ: `${deg}deg` }],
    };
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background track */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: theme.colors.border,
          },
        ]}
      />

      {/* Right half mask */}
      <View
        style={[
          styles.halfMask,
          {
            width: half,
            height: size,
            left: half,
            overflow: 'hidden',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.halfRing,
            {
              width: half,
              height: size,
              borderRadius: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: half,
              borderBottomRightRadius: half,
              borderWidth: strokeWidth,
              borderLeftWidth: 0,
              borderColor: theme.colors.primary,
              left: -half,
              transformOrigin: 'right center' as unknown as string,
            },
            rightStyle,
          ]}
        />
      </View>

      {/* Left half mask */}
      <View
        style={[
          styles.halfMask,
          {
            width: half,
            height: size,
            left: 0,
            overflow: 'hidden',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.halfRing,
            {
              width: half,
              height: size,
              borderRadius: 0,
              borderTopLeftRadius: half,
              borderBottomLeftRadius: half,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderWidth: strokeWidth,
              borderRightWidth: 0,
              borderColor: theme.colors.primary,
              left: half,
              transformOrigin: 'left center' as unknown as string,
            },
            leftStyle,
          ]}
        />
      </View>

      {/* Centre label */}
      <View
        style={[
          styles.center,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: theme.colors.text, fontSize: size * 0.22 },
          ]}
        >
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  halfMask: {
    position: 'absolute',
    top: 0,
  },
  halfRing: {
    position: 'absolute',
    top: 0,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});

export default ProgressRing;
