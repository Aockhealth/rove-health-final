import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSpring, interpolate, Extrapolation } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export function PhaseOrbRing({ colors, size = 220 }: { colors: readonly [string, string, ...string[]]; size?: number }) {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  useEffect(() => {
    rotation1.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
    rotation2.value = withRepeat(withTiming(-360, { duration: 25000, easing: Easing.linear }), -1, false);
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Bound the movement so it doesn't go too far out of the circle
      panX.value = interpolate(e.translationX, [-size, size], [-size * 0.25, size * 0.25], Extrapolation.CLAMP);
      panY.value = interpolate(e.translationY, [-size, size], [-size * 0.25, size * 0.25], Extrapolation.CLAMP);
    })
    .onEnd(() => {
      panX.value = withSpring(0, { damping: 12, stiffness: 90 });
      panY.value = withSpring(0, { damping: 12, stiffness: 90 });
    });

  const style1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value * 0.6 },
      { translateY: panY.value * 0.6 },
      { rotate: `${rotation1.value}deg` }
    ]
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
      { rotate: `${rotation2.value}deg` }
    ]
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'absolute', shadowColor: colors[0], shadowRadius: 35, shadowOpacity: 0.8, shadowOffset: { width: 0, height: 0 }, elevation: 0 }]}>
        {Platform.OS === 'android' && (
          <Svg style={{ position: 'absolute', width: size * 1.5, height: size * 1.5 }}>
            <Defs>
              <SvgRadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="30%" stopColor={colors[0]} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#glow)" />
          </Svg>
        )}
        <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, style1]}>
          <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', width: size - 8, height: size - 8, borderRadius: size / 2, overflow: 'hidden', opacity: 0.5 }, style2]}>
          <LinearGradient colors={colors} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
