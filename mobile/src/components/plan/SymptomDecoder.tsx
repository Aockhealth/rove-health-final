import React from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Zap, Brain, Wind, Moon, Activity, Droplets, Utensils, Heart, Info, Check } from 'lucide-react-native';
import { phaseThemes } from '../../data/home-content';
import { SectionHeader } from './SectionHeader';

interface SymptomDecoderProps {
    data: {
        title: string;
        subtitle: string;
        cards: {
            title: string;
            condition: string;
            biology: string;
            fix: string;
            diet?: string;
        }[];
    };
    phase?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const getIconForSymptom = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('cramp') || t.includes('pain')) return Zap;
    if (t.includes('mood') || t.includes('emotion') || t.includes('anxiety')) return Brain;
    if (t.includes('bloat') || t.includes('digestion')) return Wind;
    if (t.includes('fatigue') || t.includes('energy') || t.includes('tired')) return Moon;
    if (t.includes('headache') || t.includes('migraine')) return Activity;
    if (t.includes('acne') || t.includes('skin') || t.includes('breakout')) return Droplets;
    if (t.includes('sleep') || t.includes('insomnia')) return Moon;
    if (t.includes('craving') || t.includes('hunger')) return Utensils;
    return Heart;
};

function SymptomCard({ card, idx, theme }: { card: any, idx: number, theme: any }) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <Animated.View entering={FadeInRight.delay(idx * 150).springify()}>
            <Pressable
                onPressIn={() => {
                    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
                }}
                onPressOut={() => {
                    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
                }}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
            >
                <Animated.View 
                    className="rounded-[32px] p-6 border shadow-sm mr-4 overflow-hidden relative"
                    style={[{ 
                        width: CARD_WIDTH,
                        borderColor: 'rgba(255,255,255,0.6)',
                        shadowColor: theme.color,
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: Platform.OS === 'ios' ? 5 : 0,
                    }, animatedStyle]}
                >
                    {/* Glass Background */}
                    {Platform.OS === 'ios' ? (
                      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFillObject} />
                    ) : (
                      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                    )}
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                    <LinearGradient
                        colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.05)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.8, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    


                    {/* Header */}
                    <View className="flex-row items-center mb-6">
                        <View 
                            className="w-10 h-10 rounded-[14px] items-center justify-center mr-3 border border-white/50" 
                            style={{ backgroundColor: `${theme.color}15`, shadowColor: theme.color, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                        >
                            {(() => {
                                const Icon = getIconForSymptom(card.title);
                                return <Icon size={18} color={theme.color} strokeWidth={2.5} />;
                            })()}
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                                {card.title}
                            </Text>
                            <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-rove-charcoal/70 mt-1">
                                {card.condition}
                            </Text>
                        </View>
                    </View>

                    {/* Science Section */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-2.5">
                            <Info size={12} color={theme.color} strokeWidth={3} />
                            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] ml-2" style={{ color: theme.textColor }}>
                                The Science
                            </Text>
                        </View>
                        <View className="p-4 rounded-[20px] border border-white/40 bg-white/40">
                            <Text className="text-[13px] text-rove-charcoal/90 leading-[22px] font-medium">
                                {card.biology}
                            </Text>
                        </View>
                    </View>

                    {/* Protocol / Fix */}
                    <View>
                        <View className="flex-row items-center mb-2.5">
                            <Zap size={12} color={theme.color} strokeWidth={3} />
                            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] ml-2" style={{ color: theme.textColor }}>
                                The Protocol
                            </Text>
                        </View>
                        <View 
                            className="flex-row items-start p-4 rounded-[20px] border border-white/50" 
                            style={{ backgroundColor: `${theme.color}30` }}
                        >
                            <View className="mt-0.5 w-6 h-6 rounded-full items-center justify-center mr-3 bg-white border border-white/60 shadow-sm">
                                <Check size={12} color={theme.color} strokeWidth={3} />
                            </View>
                            <Text className="text-[13px] font-bold text-rove-charcoal/90 flex-1 leading-[22px]">
                                {card.diet || card.fix}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

export function SymptomDecoder({ data, phase }: SymptomDecoderProps) {
    if (!data || !data.cards || data.cards.length === 0) return null;

    const currentPhase = phase || "Menstrual";
    const theme = phaseThemes[currentPhase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    return (
        <View className="mb-10">
            <SectionHeader icon="activity" title={data.title} subtitle={data.subtitle} color={theme.color} />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                snapToInterval={CARD_WIDTH + 16} // width + margin
                decelerationRate="fast"
                style={{ marginHorizontal: -20 }}
            >
                {data.cards.map((card, idx) => (
                    <SymptomCard key={idx} card={card} idx={idx} theme={theme} />
                ))}
            </ScrollView>
        </View>
    );
}
