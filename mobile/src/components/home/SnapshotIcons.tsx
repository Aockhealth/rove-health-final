import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Sun } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Native equivalents of the four watermark icons on the web app's
 * cycle-sync page (HormoneWave, MindSynapse, BodyDNA, GlowHalo).
 */

type IconProps = { color?: string; size?: number };

/* ─── HORMONES: Two flowing sine waves ─── */
export function HormoneWave({ color = '#FB7185', size = 90 }: IconProps) {
  const tx = useSharedValue(0);

  useEffect(() => {
    // One full wave cycle = 50 SVG units.
    // In pixels: 50 * (size * 3 / 300) = size / 2.
    // Translate by exactly one wavelength for a seamless loop.
    tx.value = withRepeat(
      withTiming(-(size / 2), { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, [size]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Animated.View style={[{ width: size * 3, height: size, position: 'absolute' }, waveStyle]}>
        <Svg viewBox="0 0 300 100" width="100%" height="100%">
          {/* Primary thick wave */}
          <Path
            d="M0 50 Q12.5 20,25 50 T50 50 T75 50 T100 50 T125 50 T150 50 T175 50 T200 50 T225 50 T250 50 T275 50 T300 50"
            stroke={color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
          {/* Secondary thin wave — inverted */}
          <Path
            d="M0 50 Q12.5 80,25 50 T50 50 T75 50 T100 50 T125 50 T150 50 T175 50 T200 50 T225 50 T250 50 T275 50 T300 50"
            stroke={color}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

/* ─── MIND: Central node with radiating spokes ─── */
export function MindSynapse({ color = '#64748B', size = 90 }: IconProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.15 + 0.2 * (pulse.value - 1) / 0.4,
  }));

  const angles = [0, 72, 144, 216, 288];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulsing glow behind center */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: size,
            backgroundColor: color,
          },
          pulseStyle,
        ]}
      />
      {/* Static SVG spokes + center dot */}
      <Svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute' }}>
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 50 + 35 * Math.cos(rad);
          const y2 = 50 + 35 * Math.sin(rad);
          return (
            <Line
              key={i}
              x1={50}
              y1={50}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}
        <Circle cx={50} cy={50} r={9} fill={color} opacity={1} />
      </Svg>
    </View>
  );
}

/* ─── BODY: DNA ladder with pulsing rungs ─── */
export function BodyDNA({ color = '#10B981', size = 90 }: IconProps) {
  const breathe = useSharedValue(1);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1.06, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: breathe.value }],
  }));

  const rows = [10, 30, 50, 70, 90];

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: '100%', height: '100%' }, breatheStyle]}>
        <Svg viewBox="0 0 100 100" width="100%" height="100%">
          {/* Vertical rails */}
          <Line x1={30} y1={0} x2={30} y2={100} stroke={color} strokeWidth={4} opacity={0.4} />
          <Line x1={70} y1={0} x2={70} y2={100} stroke={color} strokeWidth={4} opacity={0.4} />
          {/* Horizontal rungs */}
          {rows.map((y, i) => (
            <Line
              key={i}
              x1={30}
              y1={y}
              x2={70}
              y2={y}
              stroke={color}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.5 + i * 0.1}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

/* ─── SKIN: Rotating dashed halo with sun ─── */
export function GlowHalo({ color = '#F59E0B', size = 90 }: IconProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withTiming(0.9, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer rotating dashed ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 0.92,
            height: size * 0.92,
            borderRadius: size / 2,
            borderWidth: 3.5,
            borderColor: color,
            borderStyle: 'dashed',
            opacity: 0.65,
          },
          ringStyle,
        ]}
      />
      {/* Inner breathing solid ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: size,
            borderWidth: 5,
            borderColor: color,
            opacity: 0.35,
          },
          innerStyle,
        ]}
      />
      {/* Sun icon at center */}
      <Sun size={size * 0.32} color={color} strokeWidth={2} opacity={0.7} />
    </View>
  );
}
