import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { phaseThemes } from '../../../data/home-content';
import { BLUEPRINTS } from '@shared/content/plan-blueprints';

export default function PhaseDeepDiveScreen() {
    const { phase } = useLocalSearchParams();
    const router = useRouter();

    const phaseName = (Array.isArray(phase) ? phase[0] : phase) || 'Menstrual';
    const theme = phaseThemes[phaseName as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    const bp = BLUEPRINTS[phaseName as keyof typeof BLUEPRINTS] || BLUEPRINTS.Menstrual;

    return (
        <SafeAreaView className="flex-1 bg-[#FAF9F6]">
            <View className="flex-row items-center justify-between p-5 border-b border-rove-stone/10 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="arrow-left" size={24} color="#2D2420" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-rove-charcoal">{phaseName} Deep Dive</Text>
                <View className="w-10" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Intro Section */}
                <View className="mb-8 items-center pt-4">
                    <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: `${theme.color}20` }}>
                        <Feather name="droplet" size={32} color={theme.color} />
                    </View>
                    <Text className="text-3xl text-center mb-2" style={{ fontFamily: 'CormorantGaramond-Bold', color: theme.color }}>
                        The {phaseName} Phase
                    </Text>
                    <Text className="text-rove-stone text-center px-4 leading-6">
                        {bp.hormones?.desc || "Understand your body's natural rhythms during this phase."}
                    </Text>
                </View>

                {/* Hormonal State */}
                <View className="bg-white rounded-3xl p-6 mb-6 border border-rove-stone/10 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.color}15` }}>
                            <Feather name="zap" size={14} color={theme.color} />
                        </View>
                        <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Hormonal State</Text>
                    </View>
                    <Text className="text-rove-charcoal text-sm leading-6 mb-4">
                        {bp.hormones?.summary}
                    </Text>
                    
                    <View className="bg-[#FAF9F6] p-4 rounded-2xl border border-rove-stone/10">
                        <Text className="text-[10px] uppercase font-bold tracking-widest text-rove-stone mb-2">Common Symptoms</Text>
                        <View className="flex-row flex-wrap">
                            {bp.hormones?.symptoms.map((sym: string, i: number) => (
                                <View key={i} className="bg-white px-3 py-1.5 rounded-full border border-rove-stone/10 mr-2 mb-2">
                                    <Text className="text-xs text-rove-charcoal font-medium">{sym}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Rituals & Practices */}
                <View className="bg-white rounded-3xl p-6 mb-6 border border-rove-stone/10 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.color}15` }}>
                            <Feather name="moon" size={14} color={theme.color} />
                        </View>
                        <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Rituals & Relief</Text>
                    </View>
                    
                    {bp.rituals?.practices.map((prac: any, i: number) => (
                        <View key={`prac-${i}`} className="mb-4">
                            <Text className="font-bold text-rove-charcoal mb-1">{prac.name}</Text>
                            <Text className="text-xs text-rove-stone leading-5">{prac.desc}</Text>
                        </View>
                    ))}

                    <View className="h-px bg-rove-stone/10 w-full my-2" />
                    
                    {bp.rituals?.symptom_relief.map((sr: any, i: number) => (
                        <View key={`sr-${i}`} className="mt-4">
                            <Text className="text-[10px] uppercase tracking-widest font-bold text-rove-stone mb-1">{sr.symptom}</Text>
                            <Text className="text-sm text-rove-charcoal">{sr.remedy}</Text>
                        </View>
                    ))}
                </View>

                {/* Diet */}
                <View className="bg-white rounded-3xl p-6 mb-6 border border-rove-stone/10 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.color}15` }}>
                            <Feather name="coffee" size={14} color={theme.color} />
                        </View>
                        <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Nutrition Focus</Text>
                    </View>
                    
                    <View className="mb-4">
                        <Text className="text-[10px] uppercase font-bold tracking-widest text-rove-stone mb-2">Core Needs</Text>
                        {bp.diet?.core_needs.map((need: any, i: number) => (
                            <View key={`need-${i}`} className="mb-3">
                                <Text className="font-bold text-sm text-rove-charcoal">{need.title}</Text>
                                <Text className="text-xs text-rove-stone">{need.why}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
