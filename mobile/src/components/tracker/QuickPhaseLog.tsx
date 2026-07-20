import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Activity, Smile, Heart, Check } from 'lucide-react-native';
import { SymptomChip } from './SymptomChip';
import { Phase, PHASE_COLORS } from './CycleCalendar';

// Ported from frontend/src/app/cycle-sync/tracker/components/QuickPhaseLog.tsx —
// keep the suggestion sets and phase copy in sync with that file if it changes.
type SuggestionType = 'symptom' | 'mood' | 'sex' | 'disruptor';

interface Suggestion {
  label: string;
  type: SuggestionType;
}

const PHASE_SUGGESTIONS: Record<Exclude<Phase, null>, Suggestion[]> = {
  Menstrual: [
    { label: 'Cramps', type: 'symptom' },
    { label: 'Fatigue', type: 'symptom' },
    { label: 'Low mood', type: 'mood' },
    { label: 'Painkillers', type: 'disruptor' },
  ],
  Follicular: [
    { label: 'Energetic', type: 'mood' },
    { label: 'Calm', type: 'mood' },
  ],
  Ovulatory: [
    { label: 'High sex drive', type: 'sex' },
    { label: 'Energetic', type: 'mood' },
    { label: 'Breast Pain', type: 'symptom' },
  ],
  Luteal: [
    { label: 'Bloating', type: 'symptom' },
    { label: 'Acne', type: 'symptom' },
    { label: 'Irritable', type: 'mood' },
    { label: 'High sugar', type: 'disruptor' },
  ],
};

const TYPE_COLORS: Record<SuggestionType, string> = {
  symptom: '#E07B7B',
  mood: '#B07FC0',
  sex: '#E8924E',
  disruptor: '#D4A25F',
};

function TypeIcon({ type, color, size = 13 }: { type: SuggestionType; color: string; size?: number }) {
  switch (type) {
    case 'symptom':
      return <Activity size={size} color={color} />;
    case 'mood':
      return <Smile size={size} color={color} />;
    case 'sex':
      return <Heart size={size} color={color} />;
    case 'disruptor':
      return <Zap size={size} color={color} />;
  }
}

export interface QuickPhaseLogProps {
  currentPhase: Phase;
  // These four toggles are routed to the SAME state arrays the full cards
  // further down the page use (Body Signals, Inner Weather, Sexual Wellness,
  // Disruptors) — a tap here shows up as already-checked in those cards too,
  // exactly matching the web version's shared-state behavior.
  selectedSymptoms: string[];
  onToggleSymptom: (label: string) => void;
  selectedMoods: string[];
  onToggleMood: (label: string) => void;
  selectedSexActivity: string[];
  onToggleSexActivity: (label: string) => void;
  selectedDisruptors: string[];
  onToggleDisruptor: (label: string) => void;
}

export function QuickPhaseLog({
  currentPhase,
  selectedSymptoms,
  onToggleSymptom,
  selectedMoods,
  onToggleMood,
  selectedSexActivity,
  onToggleSexActivity,
  selectedDisruptors,
  onToggleDisruptor,
}: QuickPhaseLogProps) {
  if (!currentPhase) return null;

  const suggestions = PHASE_SUGGESTIONS[currentPhase] ?? [];
  if (suggestions.length === 0) return null;

  const isSelected = (s: Suggestion): boolean => {
    switch (s.type) {
      case 'symptom':
        return selectedSymptoms.includes(s.label);
      case 'mood':
        return selectedMoods.includes(s.label);
      case 'sex':
        return selectedSexActivity.includes(s.label);
      case 'disruptor':
        return selectedDisruptors.includes(s.label);
    }
  };

  const handleToggle = (s: Suggestion) => {
    switch (s.type) {
      case 'symptom':
        return onToggleSymptom(s.label);
      case 'mood':
        return onToggleMood(s.label);
      case 'sex':
        return onToggleSexActivity(s.label);
      case 'disruptor':
        return onToggleDisruptor(s.label);
    }
  };

  const accent = PHASE_COLORS[currentPhase];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${accent}26` }]}>
          <Zap size={16} color={accent} />
        </View>
        <View>
          <Text style={styles.title}>{currentPhase} Patterns</Text>
          <Text style={styles.subtitle}>Quick log common symptoms</Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        {suggestions.map((s) => {
          const active = isSelected(s);
          const color = TYPE_COLORS[s.type];
          return (
            <SymptomChip
              key={s.label}
              label={s.label}
              isSelected={active}
              onToggle={() => handleToggle(s)}
              accentColor={color}
              icon={active ? <Check size={13} color="#FFFFFF" /> : <TypeIcon type={s.type} color={color} />}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#A8A29E',
    marginTop: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
