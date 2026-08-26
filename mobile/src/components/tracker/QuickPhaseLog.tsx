import React from 'react';
import { View, Text, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Activity, Smile, Heart, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SymptomChip } from './SymptomChip';
import { Phase, PHASE_COLORS } from './CycleCalendar';
import { phaseThemes } from '../../data/home-content';
import { getLocalizedFontFamily } from '../../lib/fonts';

// Ported from frontend/src/app/cycle-sync/tracker/components/QuickPhaseLog.tsx —
// keep the suggestion sets and phase copy in sync with that file if it changes.
type SuggestionType = 'symptom' | 'mood' | 'sex' | 'disruptor';

interface Suggestion {
  /** Persisted value — routed to the same state arrays (selectedSymptoms
   * etc.) the full cards further down the page use, so this stays in
   * English regardless of app language. */
  label: string;
  /** Looks up the localized display text via `tracker.quickPhaseLog.suggestions.<labelKey>`. */
  labelKey: string;
  type: SuggestionType;
}

const PHASE_SUGGESTIONS: Record<Exclude<Phase, null>, Suggestion[]> = {
  Menstrual: [
    { label: 'Cramps', labelKey: 'cramps', type: 'symptom' },
    { label: 'Fatigue', labelKey: 'fatigue', type: 'symptom' },
    { label: 'Low mood', labelKey: 'lowMood', type: 'mood' },
    { label: 'Painkillers', labelKey: 'painkillers', type: 'disruptor' },
  ],
  Follicular: [
    { label: 'Energetic', labelKey: 'energetic', type: 'mood' },
    { label: 'Calm', labelKey: 'calm', type: 'mood' },
  ],
  Ovulatory: [
    { label: 'High sex drive', labelKey: 'highSexDrive', type: 'sex' },
    { label: 'Energetic', labelKey: 'energetic', type: 'mood' },
    { label: 'Breast Pain', labelKey: 'breastPain', type: 'symptom' },
  ],
  Luteal: [
    { label: 'Bloating', labelKey: 'bloating', type: 'symptom' },
    { label: 'Acne', labelKey: 'acne', type: 'symptom' },
    { label: 'Irritable', labelKey: 'irritable', type: 'mood' },
    { label: 'High sugar', labelKey: 'highSugar', type: 'disruptor' },
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
  const { t, i18n } = useTranslation();
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
  const cardTint = phaseThemes[currentPhase]?.cardTint ?? `${accent}26`;

  return (
    <View style={[styles.card, { shadowColor: accent }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cardTint }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${accent}26` }]}>
          <Zap size={16} color={accent} />
        </View>
        <View>
          <Text style={[styles.title, { fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }]}>
            {t('tracker.quickPhaseLog.title', { phase: t(`tracker.quickPhaseLog.phaseNames.${currentPhase}`) })}
          </Text>
          <Text style={styles.subtitle}>{t('tracker.quickPhaseLog.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        {suggestions.map((s) => {
          const active = isSelected(s);
          const color = TYPE_COLORS[s.type];
          return (
            <SymptomChip
              key={s.label}
              label={t(`tracker.quickPhaseLog.suggestions.${s.labelKey}`)}
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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === 'ios' ? 4 : 0,
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
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Raleway-Medium',
    color: '#A8A29E',
    marginTop: 1,
    includeFontPadding: false,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
