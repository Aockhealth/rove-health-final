import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

const FACTS = [
  "The menstrual cycle has four phases: Menstrual, Follicular, Ovulatory, and Luteal.",
  "Your energy naturally peaks during the ovulatory phase.",
  "Gentle movement during your period can help relieve cramps.",
  "Hydration is especially important in the luteal phase to reduce bloating.",
];

export default function LoadingScreen() {
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.9);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Initial fade in
    markOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    
    // Gentle pulse animation
    markScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Cycle through facts
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const insets = useSafeAreaInsets();

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <Animated.View style={markStyle}>
        <Image
          source={require('../../../assets/images/splash-mark.png')}
          style={{ width: 80, height: 80 * (532 / 257) }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* bottom is additive on top of the base 100 instead of replacing it —
          on 3-button-nav Android phones the system nav bar alone can take
          ~48dp (vs ~16dp for gesture nav / iOS's home indicator), which ate
          into the fixed 100 and clipped this text at the screen edge. */}
      <View style={[styles.factContainer, { bottom: 100 + insets.bottom }]}>
        <Animated.Text
          key={factIndex}
          entering={FadeIn.duration(600).delay(200)}
          exiting={FadeOut.duration(400)}
          style={styles.factText}
        >
          {FACTS[factIndex]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  factContainer: {
    position: 'absolute',
    left: 40,
    right: 40,
    alignItems: 'center',
    height: 60,
  },
  factText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 20,
  },
});
