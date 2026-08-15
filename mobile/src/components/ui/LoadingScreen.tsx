import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
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
import { phaseThemes } from '../../data/home-content';

const FACTS = [
  "The menstrual cycle has four phases: Menstrual, Follicular, Ovulatory, and Luteal.",
  "Your energy naturally peaks during the ovulatory phase.",
  "Gentle movement during your period can help relieve cramps.",
  "Hydration is especially important in the luteal phase to reduce bloating.",
];

const DEFAULT_GLOW_COLOR = '#AF6B6B';

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function LoadingScreen() {
  // Opportunistically picks up whatever phase color is already cached from the
  // dashboard query (e.g. navigating away and back), so the loading screen matches
  // the app's current phase instead of always showing one fixed color. Falls back
  // to the default when nothing is cached yet (first load, before login).
  const queryClient = useQueryClient();
  const cachedDashboard = queryClient.getQueryData<{ phase?: { name?: string } }>(['dashboard']);
  const phaseName = cachedDashboard?.phase?.name;
  const glowColor = (phaseName && phaseThemes[phaseName]?.color) || DEFAULT_GLOW_COLOR;

  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.9);
  const glowScale = useSharedValue(0.9);
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

    // Slower, wider breathing glow behind the mark
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1800, easing: Easing.inOut(Easing.ease) })
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

  const glowStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <View style={styles.centerBlock}>
        <View style={styles.markStage}>
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.glow, { backgroundColor: hexToRgba(glowColor, 0.14) }, glowStyle]} />
          <Animated.View style={[styles.markWrap, { shadowColor: glowColor }, markStyle]}>
            <Image
              source={require('../../../assets/images/splash-mark.png')}
              style={{ width: 100, height: 100 * (532 / 257) }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <View style={styles.factContainer}>
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
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markStage: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    borderRadius: 130,
  },
  markWrap: {
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  factContainer: {
    marginTop: 36,
    width: 280,
    alignItems: 'center',
    minHeight: 60,
  },
  factText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 20,
  },
});
