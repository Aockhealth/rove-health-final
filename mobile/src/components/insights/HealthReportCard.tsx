import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { prepareHealthReport, REPORT_WINDOW_DAYS, type PreparedReport } from '../../lib/healthReport';
import { HealthReportViewer } from './HealthReportViewer';

// iconBg (not cardTint) is the token meant for small icon-badge containers.
type Theme = { color: string; iconBg: string };

const CONTENTS = [
  { icon: 'repeat', label: 'Cycle regularity, length and bleed statistics' },
  { icon: 'activity', label: 'Symptoms and mood, broken down by cycle phase' },
  { icon: 'moon', label: 'Sleep, hydration and movement averages' },
  { icon: 'target', label: 'Personal suggestions, on their own page' },
] as const;

export function HealthReportCard({ theme }: { theme: Theme }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prepared, setPrepared] = useState<PreparedReport | null>(null);

  const handleGenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    const result = await prepareHealthReport();
    setIsGenerating(false);

    if (result.ok) {
      setPrepared(result.prepared);
    } else {
      if (result.reason === 'no-data') {
        toast.error('Not enough data yet', {
          description: 'Log a few days first — the report needs something to summarise.',
        });
      } else {
        toast.error('Could not create the report', {
          description: 'Please try again in a moment.',
        });
      }
    }
  };

  return (
    <View className="mt-4 rounded-[28px] border border-rove-stone/10 bg-white/80 p-6">
      <View className="items-center">
        <View
          className={`mb-4 h-16 w-16 items-center justify-center rounded-full bg-white ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}
          style={{ shadowColor: theme.color, shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Feather name="file-text" size={24} color={theme.color} />
        </View>
        <Text
          className="mb-2 text-2xl text-rove-charcoal"
          style={{ fontFamily: 'CormorantGaramond-Bold' }}
        >
          Health Report
        </Text>
        <Text className="mb-5 max-w-[260px] text-center text-rove-stone">
          A PDF summary of your last {REPORT_WINDOW_DAYS} days, laid out for a doctor to read
          quickly.
        </Text>
      </View>

      <View className="mb-5 gap-3">
        {CONTENTS.map((item) => (
          <View key={item.label} className="flex-row items-center gap-3">
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.iconBg }}
            >
              <Feather name={item.icon} size={13} color={theme.color} />
            </View>
            <Text className="flex-1 text-sm text-rove-charcoal">{item.label}</Text>
          </View>
        ))}
      </View>

      <View className="mb-5 flex-row items-start gap-2 rounded-2xl bg-stone-50/80 p-3">
        <Feather name="shield" size={13} color="#78716C" style={{ marginTop: 2 }} />
        <Text className="flex-1 text-xs leading-4 text-stone-500">
          Built entirely on your phone. None of your health data is sent to an AI service or any
          third party — you choose where the finished PDF goes.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleGenerate}
        disabled={isGenerating}
        activeOpacity={0.85}
        className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
        style={{ backgroundColor: theme.color, opacity: isGenerating ? 0.6 : 1 }}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Feather name="file-text" size={16} color="#FFFFFF" />
        )}
        <Text className="text-sm font-bold tracking-wide text-white">
          {isGenerating ? 'Preparing your report…' : 'View Health Report'}
        </Text>
      </TouchableOpacity>

      <HealthReportViewer
        prepared={prepared}
        accentColor={theme.color}
        onClose={() => setPrepared(null)}
      />
    </View>
  );
}
