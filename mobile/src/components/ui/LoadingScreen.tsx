import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { phaseThemes } from '../../data/home-content';
import { getLocalizedFontFamily } from '../../lib/fonts';

const FACT_DURATION_MS = 5000;

const DEFAULT_GLOW_COLOR = '#AF6B6B';

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function LoadingScreen() {
  const { t, i18n } = useTranslation();
  const facts = t('common.loadingFacts', { returnObjects: true }) as string[];

  // Opportunistically picks up whatever phase color is already cached from the
  // dashboard query (e.g. navigating away and back), so the loading screen matches
  // the app's current phase instead of always showing one fixed color. Falls back
  // to the default when nothing is cached yet (first load, before login).
  const queryClient = useQueryClient();
  const cachedDashboard = queryClient.getQueryData<{ phase?: { name?: string } }>(['dashboard']);
  const phaseName = cachedDashboard?.phase?.name;
  const glowColor = (phaseName && phaseThemes[phaseName]?.color) || DEFAULT_GLOW_COLOR;

  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.94);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Same calm one-shot fade + settle as SplashIntro, no looping pulse, no
    // breathing glow. This screen can reappear often (every tab load), so an
    // animation that keeps moving reads as busy rather than premium. The facts
    // below are the one thing allowed to keep changing, slowly, since they're
    // meant to be read rather than glanced past.
    markOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    markScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, FACT_DURATION_MS);

    return () => clearInterval(interval);
  }, []);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <View style={styles.markStage}>
        <View style={[StyleSheet.absoluteFillObject, styles.glow, { backgroundColor: hexToRgba(glowColor, 0.1) }]} />
        <Animated.View style={[styles.markWrap, { shadowColor: glowColor }, markStyle]}>
          <Image
            source={require('../../../assets/images/splash-mark.png')}
            style={{ width: 56, height: 56 * (532 / 257) }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.factContainer}>
        <Animated.Text
          key={factIndex}
          entering={FadeIn.duration(700).delay(150)}
          exiting={FadeOut.duration(500)}
          style={[styles.factText, { fontFamily: getLocalizedFontFamily('CormorantGaramond-Medium', i18n.language) }]}
        >
          {facts[factIndex]}
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
  markStage: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glow: {
    borderRadius: 70,
  },
  markWrap: {
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  factContainer: {
    width: 300,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  factText: {
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 30,
    color: '#2D2420',
    textAlign: 'center',
  },
});
