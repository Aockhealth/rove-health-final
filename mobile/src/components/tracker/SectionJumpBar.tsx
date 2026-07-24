import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sun, Zap, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SymptomChip } from './SymptomChip';

export type JumpSection = 'daily' | 'lifestyle' | 'intimacy';

interface Item {
  key: JumpSection;
  label: string;
  color: string;
  Icon: typeof Sun;
}

const ITEMS: Item[] = [
  { key: 'daily', label: 'Daily', color: '#AF6B6B', Icon: Sun },
  { key: 'lifestyle', label: 'Lifestyle', color: '#4DB6AC', Icon: Zap },
  { key: 'intimacy', label: 'Intimacy', color: '#E8924E', Icon: Heart },
];

interface SectionJumpBarProps {
  onJump: (section: JumpSection) => void;
  accentColor?: string;
}

// Quick-access row — lets someone skip straight to Lifestyle or Intimacy
// (both tucked far down the page and collapsed by default) instead of
// scrolling past everything else, or jump back to the top of today's log.
// Built from the same SymptomChip already used everywhere else on this
// screen (Quick Phase Log, Body Signals, ...) rather than a bespoke chip
// style — a hand-rolled look-alike didn't actually match, and stacking it
// in its own extra card on top of the calendar/Follicular Patterns/etc.
// cards just added another box to an already box-heavy page. This is a
// plain labeled row, no card of its own.
export function SectionJumpBar({ onJump, accentColor }: SectionJumpBarProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Jump to</Text>
      <View style={styles.row}>
        {ITEMS.map(({ key, label, color, Icon }) => {
          const tint = key === 'daily' ? accentColor ?? color : color;
          return (
            <SymptomChip
              key={key}
              label={label}
              isSelected={false}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onJump(key);
              }}
              accentColor={tint}
              icon={<Icon size={12} color={tint} />}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#A8A29E',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
