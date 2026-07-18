import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export function AnimatedBackground() {
  const orb1X = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  
  const orb2X = useSharedValue(0);
  const orb2Y = useSharedValue(0);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(30, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    orb2X.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb2Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: '#F9F9F5' }]} pointerEvents="none">
      <Animated.View
        style={[
          animatedStyle1,
          {
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: 400,
            height: 400,
            borderRadius: 200,
            backgroundColor: '#AF6B6B',
            opacity: 0.15,
            filter: 'blur(60px)',
          } as any
        ]}
      />
      <Animated.View
        style={[
          animatedStyle2,
          {
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: 450,
            height: 450,
            borderRadius: 225,
            backgroundColor: '#8DAA9D',
            opacity: 0.15,
            filter: 'blur(80px)',
          } as any
        ]}
      />
    </View>
  );
}
