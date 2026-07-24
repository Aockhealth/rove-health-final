import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets } from 'lucide-react-native';
import { SymptomChip } from './SymptomChip';
import { PHASE_COLORS } from './CycleCalendar';

// Ported from frontend/src/app/cycle-sync/tracker/components/FlowCard.tsx —
// shown on menstrual days instead of the Discharge questionnaire (mobile
// previously always showed Discharge regardless of phase, which is what
// FlowCard fixes: menstrual days ask about flow intensity, non-menstrual
// days ask about discharge).
const FLOW_OPTIONS = ['Spotting', 'Low', 'Normal', 'High', 'Heavy'];
const ACCENT = PHASE_COLORS.Menstrual;

export interface FlowCardProps {
  flowIntensity: string | null;
  onFlowIntensityChange: (intensity: string | null) => void;
  /** Shared page-level phase tint (same value every other tracker card
   * uses) — keeps this card's fill consistent with the rest of the page
   * instead of a locally-derived one-off. */
  cardTint?: string;
}

export function FlowCard({ flowIntensity, onFlowIntensityChange, cardTint }: FlowCardProps) {
  return (
    <View style={styles.card}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cardTint ?? `${ACCENT}26` }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <Droplets size={18} color={ACCENT} />
        <Text style={styles.title}>Flow</Text>
      </View>

      <View style={styles.chipWrap}>
        {FLOW_OPTIONS.map((f) => {
          const isActive = flowIntensity === f;
          return (
            <SymptomChip
              key={f}
              label={f}
              isSelected={isActive}
              onToggle={() => onFlowIntensityChange(isActive ? null : f)}
              accentColor={ACCENT}
              activeColor={ACCENT}
              activeVariant="soft"
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: ACCENT,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
