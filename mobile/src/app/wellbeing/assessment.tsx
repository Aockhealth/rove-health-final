import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

function getResultDetails(score: number, isGAD7: boolean) {
  if (isGAD7) {
    if (score <= 4) return { label: 'Minimal Anxiety', color: '#4caf8a' };
    if (score <= 9) return { label: 'Mild Anxiety', color: '#f5a623' };
    if (score <= 14) return { label: 'Moderate Anxiety', color: '#e8804a' };
    return { label: 'Severe Anxiety', color: '#d64545' };
  }
  if (score <= 4) return { label: 'Minimal Depression', color: '#4caf8a' };
  if (score <= 9) return { label: 'Mild Depression', color: '#f5a623' };
  if (score <= 14) return { label: 'Moderate Depression', color: '#e8804a' };
  if (score <= 19) return { label: 'Moderately Severe', color: '#d64545' };
  return { label: 'Severe Depression', color: '#d64545' };
}

export default function WellbeingAssessmentScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();
  const isGAD7 = type === 'gad7';

  const currentQuestions = isGAD7 ? GAD7_QUESTIONS : PHQ9_QUESTIONS;
  const assessmentTitle = isGAD7 ? 'GAD-7' : 'PHQ-9';
  const assessmentSubtitle = isGAD7 ? 'Anxiety Assessment' : 'Patient Health Questionnaire';
  const maxScore = isGAD7 ? 21 : 27;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const isComplete = currentStep === currentQuestions.length;
  const progressPercentage = (currentStep / currentQuestions.length) * 100;
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const resultDetails = getResultDetails(totalScore, isGAD7);
  const selectedValue = answers[currentStep];

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 450);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAF9]" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}>
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Self-Assessment
          </Text>
          <Text className="text-3xl font-bold text-rove-charcoal mb-1 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            {assessmentSubtitle}
          </Text>
          <Text className="text-[13px] font-bold text-stone-500 tracking-widest">
            {assessmentTitle}
          </Text>
        </View>

        {/* Progress Bar */}
        {!isComplete && (
          <View className="mb-6">
            <View className="flex-row justify-between mb-2 px-1">
              <Text className="text-xs text-stone-400 font-semibold">
                Question {currentStep + 1} of {currentQuestions.length}
              </Text>
              <Text className="text-xs text-stone-400 font-semibold">
                {Math.round(progressPercentage)}% complete
              </Text>
            </View>
            <View className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <View className="h-full rounded-full" style={{ width: `${progressPercentage}%`, backgroundColor: '#AF6B6B' }} />
            </View>
          </View>
        )}

        {/* Card */}
        <View className="bg-white rounded-[1.5rem] border border-stone-200 shadow-sm overflow-hidden" style={{ minHeight: 440 }}>
          {!isComplete ? (
            <Animated.View key={currentStep} entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} className="p-6">
              <View className="bg-stone-50 border border-stone-100 rounded-xl p-3 mb-6">
                <Text className="text-[13px] text-stone-500 leading-relaxed">
                  Over the last <Text className="font-bold">2 weeks</Text>, how often have you been bothered by this?
                </Text>
              </View>

              <View className="flex-row items-start gap-4 mb-6">
                <View className="w-7 h-7 rounded-full bg-rove-charcoal items-center justify-center">
                  <Text className="text-white text-[13px] font-bold">{currentStep + 1}</Text>
                </View>
                <Text className="flex-1 text-xl font-bold text-rove-charcoal leading-snug" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {currentQuestions[currentStep]}
                </Text>
              </View>

              <View className="gap-3">
                {OPTIONS.map((option) => {
                  const isSelected = selectedValue === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      className="flex-row items-center justify-between p-4 rounded-xl border"
                      style={{
                        borderColor: isSelected ? '#D6D3D1' : '#F5F5F4',
                        backgroundColor: isSelected ? '#FAFAF9' : '#FFFFFF',
                      }}
                    >
                      <Text className="text-sm font-semibold text-rove-charcoal/90">{option.label}</Text>
                      <View
                        className="w-7 h-7 rounded-lg items-center justify-center"
                        style={{ backgroundColor: isSelected ? '#AF6B6B' : '#F5F5F4' }}
                      >
                        <Text className="text-xs font-bold" style={{ color: isSelected ? '#FFFFFF' : '#A8A29E' }}>
                          {option.value}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(400)} className="p-8 items-center justify-center flex-1">
              <Text className="text-2xl font-bold text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                Assessment Complete
              </Text>
              <Text className="text-[13px] text-stone-400 mb-8 font-medium">
                Based on your responses over the last 2 weeks
              </Text>

              <View className="flex-row items-baseline mb-4">
                <Text className="text-7xl font-bold text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                  {totalScore}
                </Text>
                <Text className="text-xl text-stone-300 font-medium">/{maxScore}</Text>
              </View>

              <View className="px-5 py-1.5 rounded-full mb-8" style={{ backgroundColor: `${resultDetails.color}1A` }}>
                <Text className="font-bold text-xs tracking-widest uppercase" style={{ color: resultDetails.color }}>
                  {resultDetails.label}
                </Text>
              </View>

              <View className="bg-stone-50 border border-stone-100 rounded-2xl p-4 mb-8">
                <Text className="text-[13px] text-stone-500 leading-relaxed">
                  <Text className="font-bold">This is not a medical diagnosis. Results are informational only.</Text> This score is a starting point for self-reflection. If your results feel concerning or you are struggling, please consider sharing them with a qualified health professional.
                </Text>
              </View>

              <Pressable
                onPress={() => router.dismissTo('/insights' as any)}
                className="w-full py-4 rounded-full bg-rove-charcoal items-center"
              >
                <Text className="text-white text-sm font-bold tracking-wide">Done</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
