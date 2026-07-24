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
      {/* Minus — smaller and outlined, matching web's secondary/quiet
          treatment (`w-10 h-10 rounded-full border`, no fill). */}
      <Animated.View style={minusStyle}>
        <TouchableOpacity
          onPress={() => tap(minusScale, () => {
            onDecrement?.();
            onChange(Math.max(min, value - 1));
          })}
          style={[styles.btn, styles.btnMinus, { borderColor: `${accentColor}33` }]}
        >
          <Minus size={17} color="#78716C" />
        </TouchableOpacity>
      </Animated.View>

      {/* Value display */}
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {/* Plus — larger and solid-filled, the primary action, matching web's
          `w-12 h-12` filled button with a colored shadow. */}
      <Animated.View style={plusStyle}>
        <TouchableOpacity
          onPress={() => tap(plusScale, () => {
            onIncrement?.();
            onChange(Math.min(max, value + 1));
          })}
          style={[
            styles.btn,
            styles.btnPlus,
            { backgroundColor: accentColor, shadowColor: accentColor },
          ]}
        >
          <Plus size={20} color="#FFFFFF" />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinus: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  btnPlus: {
    width: 42,
    height: 42,
    borderRadius: 21,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
  },
  unit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A8A29E',
  },
});
