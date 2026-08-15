import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Droplets, Zap, Flame, Moon } from 'lucide-react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { phaseThemes, PHASE_KEYWORDS, PHASE_EXPLAINERS } from '../../data/home-content';

const LAST_SEEN_PHASE_KEY = 'rove-last-seen-phase';

// Matches the phase icon set already used in PhaseInsightCard, rather than
// introducing a new one-off mapping.
const PHASE_ICONS: Record<string, typeof Droplets> = {
  Menstrual: Droplets,
  Follicular: Zap,
  Ovulatory: Flame,
  Luteal: Moon,
};

interface PhaseTransitionCelebrationProps {
  phaseName?: string;
}

// Celebrates the moment the app notices you've moved into a new cycle phase
// since you last opened it — a "delight" beat that's unique to a cycle app
// (most habit apps only have streaks/logging celebrations, not this).
export default function PhaseTransitionCelebration({ phaseName }: PhaseTransitionCelebrationProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [celebratingPhase, setCelebratingPhase] = useState<string | null>(null);

  useEffect(() => {
    if (!phaseName) return;
    const currentPhase: string = phaseName;

    AsyncStorage.getItem(LAST_SEEN_PHASE_KEY).then((lastSeen) => {
      if (lastSeen && lastSeen !== currentPhase) {
        setCelebratingPhase(currentPhase);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const timer = setTimeout(() => sheetRef.current?.present(), 500);
        AsyncStorage.setItem(LAST_SEEN_PHASE_KEY, currentPhase);
        return () => clearTimeout(timer);
      }
      // First-ever load, or same phase as last time — just record it silently.
      AsyncStorage.setItem(LAST_SEEN_PHASE_KEY, currentPhase);
    });
  }, [phaseName]);

  if (!celebratingPhase) return null;

  const theme = phaseThemes[celebratingPhase] || phaseThemes.Follicular;
  const Icon = PHASE_ICONS[celebratingPhase] || Zap;

  return (
    <BottomSheet ref={sheetRef} snapPoints={['50%']} showClose={false}>
      <View className="items-center">
        <LinearGradient
          colors={theme.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
        >
          <Icon size={30} color={theme.color} strokeWidth={1.75} />
        </LinearGradient>

        <Text className="mb-1 text-[11px] font-bold uppercase tracking-[2px]" style={{ color: theme.textColor }}>
          New Phase
        </Text>

        <Text className="mb-2 text-3xl text-rove-charcoal text-center" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
          Welcome to {celebratingPhase}
        </Text>

        <Text className="mb-6 text-sm font-bold uppercase tracking-widest text-rove-stone text-center">
          {PHASE_KEYWORDS[celebratingPhase]}
        </Text>

        <Text className="mb-8 px-4 text-base leading-relaxed text-rove-stone text-center italic" style={{ fontFamily: 'CormorantGaramond-Medium' }}>
          {PHASE_EXPLAINERS[celebratingPhase]}
        </Text>

        <Button
          onPress={() => sheetRef.current?.dismiss()}
          className="rounded-full px-8"
          style={{ backgroundColor: theme.textColor }}
        >
          See What's Ahead
        </Button>
      </View>
    </BottomSheet>
  );
}
