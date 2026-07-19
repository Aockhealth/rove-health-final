import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';

export interface NumericStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  accentColor?: string;
  /** Fired on every "+" tap, even when already at max (onChange's computed
   * value is clamped, so it can't be used to detect direction at the
   * boundary — that ambiguity is what caused the "stuck at 8 -> drops to 7"
   * hydration bug). Use these when the caller needs to know which button
   * was pressed, not just the resulting value. */
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function NumericStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  unit,
  accentColor = '#5B9A8B',
  onIncrement,
  onDecrement,
}: NumericStepperProps) {
  const plusScale = useSharedValue(1);
  const minusScale = useSharedValue(1);

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));
  const minusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: minusScale.value }],
  }));

  const tap = (sv: SharedValue<number>, fn: () => void) => {
    sv.value = withSpring(0.85, { damping: 12, stiffness: 400 }, () => {
      sv.value = withSpring(1, { damping: 12, stiffness: 400 });
    });
    fn();
  };

  return (
    <View style={styles.row}>
      {/* Minus */}
      <Animated.View style={minusStyle}>
        <TouchableOpacity
          onPress={() => tap(minusScale, () => {
            onDecrement?.();
            onChange(Math.max(min, value - 1));
          })}
          style={[styles.btn, styles.btnMinus]}
        >
          <Minus size={18} color="#2D2420" />
        </TouchableOpacity>
      </Animated.View>

      {/* Value display */}
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {/* Plus */}
      <Animated.View style={plusStyle}>
        <TouchableOpacity
          onPress={() => tap(plusScale, () => {
            onIncrement?.();
            onChange(Math.min(max, value + 1));
          })}
          style={[styles.btn, { backgroundColor: accentColor }]}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinus: {
    backgroundColor: '#F0ECE8',
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 60,
    justifyContent: 'center',
  },
  value: {
    fontSize: 32,
    fontFamily: 'Outfit-Bold',
    color: '#2D2420',
  },
  unit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A8A29E',
  },
});
