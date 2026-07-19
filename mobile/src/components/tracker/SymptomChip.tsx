import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export interface SymptomChipProps {
  label: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onToggle: () => void;
  variant?: 'default' | 'compact';
  /** Optional per-type border/tint color for the unselected state (e.g. the
   * phase quick-log chips, which color-code symptom/mood/sex/disruptor).
   * Omit for the plain neutral chip style used everywhere else. */
  accentColor?: string;
  /** Active-state color. Defaults to the app's near-black (#2D2420), which
   * matches every chip that predates category theming. Pass a category hex
   * (e.g. #E07B7B for Body Signals) to match the web's per-card active color. */
  activeColor?: string;
  /** 'solid' (default) = filled activeColor bg + white text/icon, matching
   * most web cards (Body Signals, Inner Weather, Exercise, Self Love...).
   * 'soft' = light activeColor-tinted bg + colored text/icon, matching the
   * web's green/red/orange "typed" chips (Sleep Quality, Disruptors, Sexual
   * Activity's negative option). */
  activeVariant?: 'solid' | 'soft';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function SymptomChip({
  label,
  icon,
  isSelected,
  onToggle,
  variant = 'default',
  accentColor,
  activeColor,
  activeVariant = 'solid',
}: SymptomChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 12, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 400 });
    });
    onToggle();
  };

  const isCompact = variant === 'compact';
  const resolvedActiveColor = activeColor ?? '#2D2420';
  const isSoft = isSelected && activeVariant === 'soft';
  const isSolid = isSelected && activeVariant !== 'soft';

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        animatedStyle,
        styles.chip,
        isCompact && styles.compact,
        isSolid && { backgroundColor: resolvedActiveColor, borderWidth: 1, borderColor: resolvedActiveColor },
        isSoft && {
          backgroundColor: `${resolvedActiveColor}1A`,
          borderWidth: 1,
          borderColor: `${resolvedActiveColor}66`,
        },
        !isSelected &&
          (accentColor
            ? { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: `${accentColor}4D` }
            : styles.unselected),
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text
        style={[
          styles.label,
          isSolid && styles.labelSelected,
          isSoft && { color: resolvedActiveColor, fontFamily: 'Inter-SemiBold' },
          !isSelected && styles.labelUnselected,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    marginRight: 8,
    marginBottom: 8,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0DB',
  },
  selected: {
    backgroundColor: '#2D2420',
    borderWidth: 1,
    borderColor: '#2D2420',
  },
  iconWrap: {
    marginRight: 5,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  labelUnselected: {
    color: '#2D2420',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
