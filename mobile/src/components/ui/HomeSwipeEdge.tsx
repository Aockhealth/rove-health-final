import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const EDGE_WIDTH = 20;
const SWIPE_THRESHOLD = 70;

// Tracker/Insights/Plan/Learn are tabs, not stack children of Home, so there's
// no native swipe-back to lean on. This recreates the left-edge swipe people
// expect from the OS gesture, scoped to a thin edge strip (like iOS's own
// back-swipe hit region) so it doesn't fight the horizontal
// scrollers/carousels already living on these screens.
export default function HomeSwipeEdge() {
  const router = useRouter();

  const goHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/(app)/home');
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(goHome)();
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <View pointerEvents="box-only" style={styles.edge} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_WIDTH,
    zIndex: 60,
  },
});
