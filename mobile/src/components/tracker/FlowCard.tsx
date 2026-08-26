import React from 'react';
import { View, Text, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SymptomChip } from './SymptomChip';
import { PHASE_COLORS } from './CycleCalendar';
import { getLocalizedFontFamily } from '../../lib/fonts';

// Ported from frontend/src/app/cycle-sync/tracker/components/FlowCard.tsx —
// shown on menstrual days instead of the Discharge questionnaire (mobile
// previously always showed Discharge regardless of phase, which is what
// FlowCard fixes: menstrual days ask about flow intensity, non-menstrual
// days ask about discharge).
// `value` is the exact FlowIntensity persisted (see shared/health/platformMapping.ts)
// — stays in English. `key` looks up the localized label via
// `tracker.flow.options.<key>`.
const FLOW_OPTIONS = [
  { value: 'Spotting', key: 'spotting' },
  { value: 'Low', key: 'low' },
  { value: 'Normal', key: 'normal' },
  { value: 'High', key: 'high' },
  { value: 'Heavy', key: 'heavy' },
];
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
  const { t, i18n } = useTranslation();
  return (
    <View style={styles.card}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cardTint ?? `${ACCENT}26` }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <Droplets size={18} color={ACCENT} />
        <Text style={[styles.title, { fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }]}>
          {t('tracker.flow.title')}
        </Text>
      </View>

      <View style={styles.chipWrap}>
        {FLOW_OPTIONS.map((f) => {
          const isActive = flowIntensity === f.value;
          return (
            <SymptomChip
              key={f.value}
              label={t(`tracker.flow.options.${f.key}`)}
              isSelected={isActive}
              onToggle={() => onFlowIntensityChange(isActive ? null : f.value)}
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
    elevation: Platform.OS === 'ios' ? 4 : 0,
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
