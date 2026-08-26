import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';

type SplashIntroProps = {
  onFinish: () => void;
};

export function SplashIntro({ onFinish }: SplashIntroProps) {
  const { t, i18n } = useTranslation();
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.88);
  const quoteOpacity = useSharedValue(0);
  const quoteTranslateY = useSharedValue(8);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    markScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });

    quoteOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));
    quoteTranslateY.value = withDelay(450, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    screenOpacity.value = withDelay(
      1900,
      withTiming(0, { duration: 350 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteTranslateY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={markStyle}>
        <Image
          source={require('../../../assets/images/splash-mark.png')}
          style={{ width: 100, height: Math.round(100 * (532 / 257)) }}
          contentFit="contain"
          transition={0}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.quote,
          { fontFamily: getLocalizedFontFamily('CormorantGaramond-Medium', i18n.language) },
          quoteStyle,
        ]}
      >
        {t('common.splash.quote')}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  quote: {
    marginTop: 28,
    fontFamily: 'CormorantGaramond-Medium',
    fontStyle: 'italic',
    fontSize: 20,
    lineHeight: 28,
    color: '#2D2420',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
