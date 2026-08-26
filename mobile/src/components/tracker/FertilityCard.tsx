import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Thermometer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { SymptomChip } from './SymptomChip';
import type { OpkResult } from '@shared/cycle/ttc';
import { getTtcOpkLabel } from '../../lib/ttcEngine';
import { getLocalizedFontFamily } from '../../lib/fonts';

// Shown only in TTC mode, alongside Flow/Discharge — the two readings the
// ovulation algorithm runs on. Everything here is one-per-day, same shape as
// the rest of daily_logs.
const ACCENT = '#C77D8F';

// Labels come from getTtcOpkLabel (ttcEngine.json's `opk.*` keys) — reusing
// the same strings Home/Insights already use for OPK results instead of a
// second, possibly-drifting translation of "Negative/Low/High/Peak".
const OPK_OPTIONS: OpkResult[] = ['negative', 'low', 'high', 'peak'];

type Unit = 'C' | 'F';

// Matches the CHECK constraint on daily_logs.bbt_celsius. Anything outside it
// is a typo, and a bad temperature quietly corrupts the coverline.
const MIN_C = 34;
const MAX_C = 40;

// Two decimals both ways — rounding °F to whole degrees would throw away the
// tenth-of-a-degree shift the whole coverline rule depends on.
const toF = (c: number): number => Math.round(((c * 9) / 5 + 32) * 100) / 100;
const toC = (f: number): number => Math.round((((f - 32) * 5) / 9) * 100) / 100;

export interface FertilityCardProps {
  bbtCelsius: number | null;
  onBbtChange: (value: number | null) => void;
  opkResult: OpkResult | null;
  onOpkChange: (value: OpkResult | null) => void;
  /**
   * The day being edited. Changing it means the value below now belongs to a
   * different date, so the text box must re-sync even mid-edit — without this,
   * tapping another day while the keyboard is open leaves the previous day's
   * digits sitting in the field.
   */
  dateKey: string;
  cardTint?: string;
}

export function FertilityCard({
  bbtCelsius,
  onBbtChange,
  opkResult,
  onOpkChange,
  dateKey,
  cardTint,
}: FertilityCardProps) {
  const { t, i18n } = useTranslation();
  const [unit, setUnit] = useState<Unit>('C');
  // The text box keeps its own buffer so half-typed values ("36.", "9") stay
  // on screen — echoing the parsed number back would erase them mid-keystroke.
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);

  // A new day is a hard reset: drop the in-edit guard so the sync below
  // reclaims the field on the next render.
  useEffect(() => {
    setTouched(false);
  }, [dateKey]);

  // Re-sync when the value changes from outside (switching days, a load
  // landing), but never while the field is being edited.
  useEffect(() => {
    if (touched) return;
    if (bbtCelsius === null) {
      setText('');
      return;
    }
    setText(String(unit === 'C' ? bbtCelsius : toF(bbtCelsius)));
  }, [bbtCelsius, unit, touched]);

  const handleTextChange = (next: string) => {
    // One decimal separator, digits only — the numeric keypad still offers
    // stray characters on some Android keyboards.
    const cleaned = next.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setText(cleaned);
    setTouched(true);

    if (cleaned === '' || cleaned === '.') {
      onBbtChange(null);
      return;
    }

    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) {
      onBbtChange(null);
      return;
    }

    const celsius = unit === 'C' ? parsed : toC(parsed);
    // A partially typed number ("3", "36" in Fahrenheit) is out of range and
    // must not reach the database, where the CHECK constraint would reject the
    // whole save. Hold it as "nothing logged" until it becomes plausible.
    onBbtChange(celsius >= MIN_C && celsius <= MAX_C ? Math.round(celsius * 100) / 100 : null);
  };

  const switchUnit = (next: Unit) => {
    if (next === unit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUnit(next);
    setTouched(false); // let the effect above rewrite the buffer in the new unit
  };

  const showRangeHint = text.trim() !== '' && bbtCelsius === null;
  const rangeLabel = unit === 'C' ? `${MIN_C}–${MAX_C} °C` : `${toF(MIN_C)}–${toF(MAX_C)} °F`;

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
        <Thermometer size={18} color={ACCENT} />
        <Text style={[styles.title, { fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }]}>
          {t('tracker.fertility.title')}
        </Text>
      </View>

      {/* ── Basal body temperature ── */}
      <Text style={styles.subLabel}>{t('tracker.fertility.bbtLabel')}</Text>
      <View style={styles.bbtRow}>
        <TextInput
          value={text}
          onChangeText={handleTextChange}
          onBlur={() => setTouched(false)}
          placeholder={unit === 'C' ? '36.50' : '97.70'}
          placeholderTextColor="#B6ADA4"
          keyboardType="decimal-pad"
          returnKeyType="done"
          maxLength={6}
          style={styles.bbtInput}
        />
        <View style={styles.unitToggle}>
          {(['C', 'F'] as Unit[]).map((u) => {
            const active = unit === u;
            return (
              <Pressable
                key={u}
                onPress={() => switchUnit(u)}
                style={[styles.unitButton, active && { backgroundColor: ACCENT }]}
              >
                <Text style={[styles.unitLabel, active && styles.unitLabelActive]}>°{u}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={[styles.hint, showRangeHint && styles.hintWarning]}>
        {showRangeHint
          ? t('tracker.fertility.rangeHint', { range: rangeLabel })
          : t('tracker.fertility.bbtHint')}
      </Text>

      {/* ── Ovulation test ── */}
      <Text style={[styles.subLabel, { marginTop: 18 }]}>{t('tracker.fertility.opkLabel')}</Text>
      <View style={styles.chipWrap}>
        {OPK_OPTIONS.map((value) => {
          const isActive = opkResult === value;
          return (
            <SymptomChip
              key={value}
              label={getTtcOpkLabel(value, t)}
              isSelected={isActive}
              onToggle={() => onOpkChange(isActive ? null : value)}
              accentColor={ACCENT}
              activeColor={ACCENT}
              activeVariant="soft"
            />
          );
        })}
      </View>
      <Text style={styles.hint}>{t('tracker.fertility.opkHint')}</Text>
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
  subLabel: {
    fontSize: 10,
    fontFamily: 'Raleway-SemiBold',
    color: '#8A8378',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bbtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bbtInput: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${ACCENT}4D`,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#2D2420',
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: `${ACCENT}4D`,
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 14,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitLabel: {
    fontSize: 13,
    fontFamily: 'Raleway-SemiBold',
    color: '#8A8378',
  },
  unitLabelActive: {
    color: '#FFFFFF',
  },
  hint: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: 'Raleway-Medium',
    color: '#8A8378',
  },
  hintWarning: {
    color: '#AF6B6B',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
