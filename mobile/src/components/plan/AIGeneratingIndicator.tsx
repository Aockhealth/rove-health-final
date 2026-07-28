import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
// The AI Chef/Coach backend has no streaming today (see ai-actions.ts) — the
// user waits for one full response with zero incremental feedback. A static
// spinner + single label made an ~5-10s wait feel much longer than it is.
// Three breathing rings + a rotating stage message costs nothing and
// meaningfully improves perceived speed while the actual backend latency
// gets addressed separately.

function Ring({ color, delay, size }: { color: string; delay: number; size: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.4 + progress.value * 0.9 }],
    opacity: 1 - progress.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

function PulsingCore({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
      <Ring color={color} delay={0} size={56} />
      <Ring color={color} delay={600} size={56} />
      <Ring color={color} delay={1200} size={56} />
      <Animated.View
        style={[
          {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
          },
          coreStyle,
        ]}
      />
    </View>
  );
}

interface AIGeneratingIndicatorProps {
  color: string;
  messages: string[];
  intervalMs?: number;
}

export function AIGeneratingIndicator({ color, messages, intervalMs = 1600 }: AIGeneratingIndicatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => Math.min(prev + 1, messages.length - 1));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [messages, intervalMs]);

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(150)}
      style={{ paddingVertical: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <PulsingCore color={color} />
      <Animated.View key={index} entering={FadeIn.duration(220)} exiting={FadeOut.duration(150)} style={{ marginTop: 20 }}>
        <Text className="text-[11px] font-bold uppercase tracking-widest text-rove-stone">
          {messages[index]}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
