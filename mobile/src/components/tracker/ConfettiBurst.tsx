import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Lightweight, dependency-free celebration burst — ported in spirit from the
// web's `canvas-confetti` call in WaterIntakeCard.tsx (same 4 colors), built
// from plain Reanimated views so it works in Expo Go with no native module.
const COLORS = ['#60A5FA', '#3B82F6', '#93C5FD', '#FFFFFF'];
const PARTICLE_COUNT = 26;

interface Particle {
  id: number;
  color: string;
  angle: number;
  distance: number;
  delay: number;
  size: number;
}

function ConfettiParticle({ color, angle, distance, delay, size }: Particle) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 650 + Math.random() * 300, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const tx = Math.cos(angle) * distance * progress.value;
    const ty = Math.sin(angle) * distance * progress.value - progress.value * 50;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: 1 - progress.value * 0.35 },
        { rotate: `${progress.value * 180}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 3, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function ConfettiBurst({ triggerKey }: { triggerKey: number }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.4,
        distance: 55 + Math.random() * 65,
        delay: Math.random() * 120,
        size: 5 + Math.random() * 5,
      })),
    [triggerKey]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle key={`${triggerKey}-${p.id}`} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  particle: {
    position: 'absolute',
  },
});
