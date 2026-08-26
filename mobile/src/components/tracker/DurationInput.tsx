import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export interface DurationInputProps {
  hours: number;
  minutes: number;
  onChangeHours: (h: number) => void;
  onChangeMinutes: (m: number) => void;
  label?: string;
  accentColor?: string;
  onTotalDurationPress?: () => void;
}

export function DurationInput({
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
  label,
  accentColor = '#5B9A8B',
  onTotalDurationPress,
}: DurationInputProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('tracker.duration.totalDuration');
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Clock size={16} color="#A8A29E" />
        <View style={styles.fields}>
          {/* Hours */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('tracker.duration.hours')}</Text>
            <TextInput
              style={styles.fieldInput}
              value={String(hours)}
              onChangeText={(t) => {
                const n = parseInt(t) || 0;
                onChangeHours(Math.min(23, Math.max(0, n)));
              }}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
          </View>

          <Text style={styles.colon}>:</Text>

          {/* Minutes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('tracker.duration.mins')}</Text>
            <TextInput
              style={styles.fieldInput}
              value={pad(minutes)}
              onChangeText={(t) => {
                const n = parseInt(t) || 0;
                onChangeMinutes(Math.min(59, Math.max(0, n)));
              }}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
          </View>
        </View>
      </View>

      {/* Total duration link */}
      <TouchableOpacity onPress={onTotalDurationPress} style={styles.totalBtn}>
        <Text style={[styles.totalLabel, { color: accentColor }]}>{resolvedLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F5',
    borderRadius: 14,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fields: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 9,
    fontFamily: 'Raleway-SemiBold',
    color: '#A8A29E',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
    minWidth: 40,
    textAlign: 'center',
  },
  colon: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#A8A29E',
    marginTop: 12,
  },
  totalBtn: {
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBE8E4',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Raleway-SemiBold',
    letterSpacing: 0.8,
  },
});
