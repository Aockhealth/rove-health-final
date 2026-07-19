import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { Accordion } from '../../components/ui/Accordion';

export default function WellbeingIntroScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const assessmentType = type || 'phq9';
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAF9]" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-4" style={{ backgroundColor: 'rgba(123, 130, 168, 0.1)' }}>
              <ShieldAlert size={24} color="#7B82A8" />
            </View>
            <Text className="text-2xl font-bold text-rove-charcoal text-center mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              Before You Begin
            </Text>
            <Text className="text-sm text-rove-stone text-center">
              Please read this carefully before starting the check-in.
            </Text>
          </View>

          {/* Accordion Sections */}
          <View className="mb-2">
            <Accordion title="What is this check-in?" themeColor="#7B82A8" defaultOpen>
              <Text className="text-sm text-rove-charcoal/90 leading-relaxed mb-3">
                This self-check uses simple questionnaires called <Text className="font-bold">PHQ-9</Text> and{' '}
                <Text className="font-bold">GAD-7</Text>. They're commonly used by doctors and therapists to screen for low mood and anxiety.
              </Text>
              <View className="gap-1.5">
                <Text className="text-sm text-rove-stone">• It takes about 5 minutes.</Text>
                <Text className="text-sm text-rove-stone">• Looks at how you've been feeling over the last 2 weeks.</Text>
                <Text className="text-sm font-bold text-rove-charcoal">• This is not a medical diagnosis.</Text>
                <Text className="text-sm text-rove-stone">• Results are informational only.</Text>
                <Text className="text-sm text-rove-stone">• This does not replace professional care.</Text>
              </View>
            </Accordion>

            <Accordion title="How accurate is it?" themeColor="#8DAA9D">
              <Text className="text-sm text-rove-stone mb-3">
                PHQ-9 and GAD-7 are well-studied screening tools and work well for many people.
              </Text>
              <View className="gap-2 mb-3">
                <View className="flex-row items-start gap-2">
                  <CheckCircle2 size={16} color="#8DAA9D" style={{ marginTop: 2 }} />
                  <Text className="text-sm text-rove-stone flex-1">
                    <Text className="font-bold">PHQ-9</Text> correctly identifies depressive symptoms in about 85-90% of cases.
                  </Text>
                </View>
                <View className="flex-row items-start gap-2">
                  <CheckCircle2 size={16} color="#8DAA9D" style={{ marginTop: 2 }} />
                  <Text className="text-sm text-rove-stone flex-1">
                    <Text className="font-bold">GAD-7</Text> correctly identifies anxiety symptoms in about 80-90% of cases.
                  </Text>
                </View>
              </View>
              <View className="p-4 rounded-2xl border" style={{ backgroundColor: 'rgba(212, 162, 95, 0.1)', borderColor: 'rgba(212, 162, 95, 0.3)' }}>
                <Text className="text-sm text-rove-charcoal leading-relaxed">
                  That said, no questionnaire is perfect. Stress, recent life events, physical health, sleep, hormones, or cultural factors can influence scores.{' '}
                  <Text className="font-bold">Results should be seen as a starting point, not a final answer.</Text>
                </Text>
              </View>
            </Accordion>
          </View>

          {/* Agreement */}
          <View className="mb-6 mt-2">
            <Text className="text-lg font-bold text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              Your Agreement
            </Text>
            <Text className="text-sm font-bold text-rove-charcoal mb-2">By continuing, you agree that:</Text>
            <View className="gap-1.5 mb-4">
              <Text className="text-sm text-rove-stone">• You understand this is a self-reflection tool, not medical advice.</Text>
              <Text className="text-sm text-rove-stone">• You're taking it voluntarily.</Text>
              <Text className="text-sm text-rove-stone">• Any next steps should involve professional support when needed.</Text>
            </View>
            <View className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(175, 107, 107, 0.1)', borderColor: 'rgba(175, 107, 107, 0.2)' }}>
              <Text className="text-sm font-semibold text-center" style={{ color: '#AF6B6B' }}>
                If your results feel concerning or if you are struggling, please consider speaking with a qualified mental health professional.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Pressable
              onPress={() => router.push({ pathname: '/wellbeing/assessment', params: { type: assessmentType } })}
              className="w-full items-center justify-center bg-rove-charcoal py-4 rounded-full"
            >
              <Text className="text-white font-bold">I understand & continue</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className="w-full flex-row items-center justify-center gap-2 bg-white border border-stone-200 py-4 rounded-full"
            >
              <ArrowLeft size={18} color="#2D2420" />
              <Text className="text-rove-charcoal font-bold">Not now</Text>
            </Pressable>
          </View>

          <Text className="text-center text-[11px] text-stone-400 mt-6 font-semibold uppercase tracking-wide">
            You're not alone - checking in is a strong first step.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
