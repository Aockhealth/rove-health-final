import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Sun } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

/**
 * Native equivalents of the four hand-drawn watermark icons on
 * frontend/src/app/cycle-sync/page.tsx (HormoneWave, MindSynapse, BodyDNA,
 * GlowHalo). Framer Motion's path-drawing animations don't have a direct
 * react-native-svg equivalent, so these use transform/opacity animation
 * instead — same silhouette and color per category, simplified motion.
 */

type IconProps = { color?: string; size?: number };

export function HormoneWave({ color = '#FB7185', size = 90 }: IconProps) {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg viewBox="0 0 100 100" width="100%" height="100%">
        <Path
          d="M0 42 C 12 26, 25 26, 37 42 C 49 58, 61 58, 73 42 C 85 26, 97 26, 100 30"
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          opacity={0.65}
        />
        <Path
          d="M0 60 C 12 48, 25 48, 37 60 C 49 72, 61 72, 73 60 C 85 48, 97 48, 100 52"
          stroke={color}
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.35}
        />
      </Svg>
    </Animated.View>
  );
}

export function MindSynapse({ color = '#64748B', size = 90 }: IconProps) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.35, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const angles = [0, 72, 144, 216, 288];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { position: 'absolute', width: size * 0.3, height: size * 0.3, borderRadius: size, backgroundColor: color, opacity: 0.2 },
          pulseStyle,
        ]}
      />
      <Svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute' }}>
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 50 + 34 * Math.cos(rad);
          const y2 = 50 + 34 * Math.sin(rad);
          return <Line key={i} x1={50} y1={50} x2={x2} y2={y2} stroke={color} strokeWidth={3.5} strokeLinecap="round" opacity={0.6} />;
        })}
        <Circle cx={50} cy={50} r={8} fill={color} />
      </Svg>
    </View>
  );
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

function DNARow({ y, color, delay }: { y: number; color: string; delay: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0.3, { duration: 1200 })), -1, false)
    );
  }, []);
  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));
  return <AnimatedLine x1={30} y1={y} x2={70} y2={y} stroke={color} strokeWidth={5} strokeLinecap="round" animatedProps={animatedProps} />;
}

export function BodyDNA({ color = '#10B981', size = 90 }: IconProps) {
  const rows = [10, 30, 50, 70, 90];
  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 100 100" width="100%" height="100%">
        <Line x1={30} y1={0} x2={30} y2={100} stroke={color} strokeWidth={3} opacity={0.25} />
        <Line x1={70} y1={0} x2={70} y2={100} stroke={color} strokeWidth={3} opacity={0.25} />
        {rows.map((y, i) => (
          <DNARow key={i} y={y} color={color} delay={i * 150} />
        ))}
      </Svg>
    </View>
  );
}

export function GlowHalo({ color = '#F59E0B', size = 90 }: IconProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(0.88, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: color,
            borderStyle: 'dashed',
            opacity: 0.6,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          { position: 'absolute', width: size * 0.68, height: size * 0.68, borderRadius: size, borderWidth: 4, borderColor: color, opacity: 0.3 },
          innerStyle,
        ]}
      />
      <Sun size={size * 0.32} color={color} strokeWidth={1.75} opacity={0.7} />
    </View>
  );
}
