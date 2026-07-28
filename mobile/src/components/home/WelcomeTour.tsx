import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Calendar, BarChart2, List } from 'lucide-react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';

const TOUR_KEY = 'rove-welcome-tour-v1';

const TOUR_STEPS = [
  {
    icon: Home,
    title: 'Welcome Home',
    body: 'This is your dashboard. See your current cycle phase, daily tips, and a body snapshot — all at a glance.',
  },
  {
    icon: Calendar,
    title: 'Track Everything',
    body: 'Log your period, symptoms, moods, and more. The more you log, the smarter your predictions get.',
  },
  {
    icon: BarChart2,
    title: 'Your Insights',
    body: 'AI-powered insights about your hormones, energy, and what your body needs — based on your phase.',
  },
  {
    icon: List,
    title: 'Your Daily Plan',
    body: 'Personalized diet, exercise, and skincare recommendations — synced to your cycle, every single day.',
  },
];

export default function WelcomeTour() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(TOUR_KEY).then((seen) => {
      if (!seen) {
        const timer = setTimeout(() => sheetRef.current?.present(), 800);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const dismissTour = () => {
    sheetRef.current?.dismiss();
    AsyncStorage.setItem(TOUR_KEY, 'done');
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismissTour();
    }
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <BottomSheet ref={sheetRef} snapPoints={['45%']} showClose={false} onDismiss={() => AsyncStorage.setItem(TOUR_KEY, 'done')}>
      <View className="items-center">
        <View className="mb-5 w-16 h-16 items-center justify-center rounded-2xl bg-rove-charcoal/5">
          <Icon size={28} color="#2D2420" strokeWidth={1.5} />
        </View>

        <Text className="mb-3 text-2xl text-rove-charcoal text-center" style={{ fontFamily: 'CormorantGaramond-Medium' }}>
          {step.title}
        </Text>

        <Text className="mb-8 text-sm leading-relaxed text-rove-stone font-medium text-center">
          {step.body}
        </Text>

        <View className="w-full flex-row items-center justify-between">
          <View className="flex-row gap-2">
            {TOUR_STEPS.map((_, i) => (
              <View
                key={i}
                className="h-1.5 rounded-full"
                style={{ width: currentStep === i ? 24 : 6, backgroundColor: currentStep === i ? '#2D2420' : 'rgba(168,162,158,0.3)' }}
              />
            ))}
          </View>

          <View className="flex-row items-center gap-4">
            {currentStep < TOUR_STEPS.length - 1 && (
              <Text onPress={dismissTour} className="text-sm font-bold tracking-wider text-rove-stone/60 uppercase">
                Skip
              </Text>
            )}
            <Button onPress={handleNext} className="rounded-full px-6">
              {currentStep === TOUR_STEPS.length - 1 ? 'Got it' : 'Next'}
            </Button>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
