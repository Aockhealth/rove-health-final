import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function LoadingScreen() {
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.9);

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
  }, []);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <Animated.View style={markStyle}>
        <Image
          source={require('../../../assets/images/splash-mark.png')}
          style={{ width: 80, height: 80 * (532 / 257) }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
