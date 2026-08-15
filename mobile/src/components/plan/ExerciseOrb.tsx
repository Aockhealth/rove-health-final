import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Reanimated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { phaseThemes } from '../../data/home-content';
import { PhaseOrbRing } from '../home/PhaseOrbRing';

interface ExerciseOrbProps {
    phase: string;
    /** Phase-level stats from the blueprint (bp.exercise); falls back to the
     * local table below if the blueprint doesn't have them for some reason,
     * so the orb never ends up with blank stats. */
    metrics?: { time?: string; unit?: string; intensity?: string; type?: string };
    /** Scrolls the parent screen down to the Rove Coach section. */
    onPressCoach?: () => void;
}

export function ExerciseOrb({ phase, metrics, onPressCoach }: ExerciseOrbProps) {
    const theme = phaseThemes[phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    const FALLBACK_METRICS: Record<string, any> = {
        "Menstrual": { time: "20", unit: "mins", intensity: "Low", type: "Restorative movement" },
        "Follicular": { time: "45", unit: "mins", intensity: "Moderate", type: "Cardio" },
        "Ovulatory": { time: "60", unit: "mins", intensity: "High", type: "HIIT" },
        "Luteal": { time: "40", unit: "mins", intensity: "Mod-High", type: "Strength" }
    };

    const fallback = FALLBACK_METRICS[phase] || FALLBACK_METRICS["Follicular"];
    const current = {
        time: metrics?.time || fallback.time,
        unit: metrics?.unit || fallback.unit,
        intensity: metrics?.intensity || fallback.intensity,
        type: metrics?.type || fallback.type,
    };

    // One-shot light sweep across the Rove Coach button, shortly after it appears
    const coachShimmerX = useSharedValue(-70);
    useEffect(() => {
        coachShimmerX.value = withDelay(500, withTiming(70, { duration: 900, easing: Easing.out(Easing.cubic) }));
    }, []);
    const coachShimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: coachShimmerX.value }, { rotate: '20deg' }],
    }));

    return (
        <View className="w-full items-center mt-6 mb-10">
            <View style={{ width: 190, height: 190 }} className="items-center justify-center relative">
                {/* Ambient glow, centered on the ring — same treatment as the home orb
                    and the Daily Fuel ring, for a consistent look across tabs */}
                <Svg width={360} height={360} style={{ position: 'absolute', top: -85, left: -85 }}>
                    <Defs>
                        <SvgRadialGradient id="exerciseOrbGlow" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor={theme.color} stopOpacity={0.16} />
                            <Stop offset="55%" stopColor={theme.color} stopOpacity={0.05} />
                            <Stop offset="100%" stopColor={theme.color} stopOpacity={0} />
                        </SvgRadialGradient>
                    </Defs>
                    <Rect width="360" height="360" fill="url(#exerciseOrbGlow)" />
                </Svg>

                <PhaseOrbRing colors={theme.orbRingColors} size={190} />

                {/* Inner Content Glass */}
                <View
                    className="items-center justify-center border overflow-hidden"
                    style={{
                        width: 160,
                        height: 160,
                        backgroundColor: '#FAF9F6',
                        borderColor: 'rgba(0,0,0,0.03)',
                        borderRadius: 150,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 15,
                        elevation: 0,
                    }}
                >
                    <Text className="text-[9px] font-bold tracking-[2px] text-rove-charcoal/70 uppercase mb-1">
                        Movement
                    </Text>
                    <Text
                        className="text-2xl mb-1"
                        style={{ color: theme.textColor, fontFamily: 'CormorantGaramond-Bold' }}
                    >
                        {current.intensity}
                    </Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-xl font-bold text-rove-charcoal">{current.time}</Text>
                        <Text className="text-[10px] text-rove-stone ml-1 font-bold uppercase tracking-widest">{current.unit}</Text>
                    </View>
                </View>
                {/* Floating ROVE COACH Button */}
                <View className="absolute right-0 bottom-4">
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onPressCoach?.();
                        }}
                        style={{ shadowColor: theme.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 0 }}
                    >
                        <View style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', borderWidth: 3, borderColor: '#FAF9F6' }}>
                            <LinearGradient
                                colors={[theme.color, theme.color + 'E6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <View className="bg-white/25 p-2 rounded-full">
                                    <Ionicons name="barbell" size={16} color="white" />
                                </View>
                            </LinearGradient>
                            {/* One-shot light sweep */}
                            <Reanimated.View pointerEvents="none" style={[{ position: 'absolute', top: -20, bottom: -20, width: 20 }, coachShimmerStyle]}>
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flex: 1 }}
                                />
                            </Reanimated.View>
                        </View>
                    </TouchableOpacity>
                    <Text
                        numberOfLines={1}
                        style={{ position: 'absolute', bottom: -20, left: -24, right: -24 }}
                        className="text-center text-[9px] font-extrabold uppercase tracking-wider text-rove-charcoal"
                    >
                        Rove Coach
                    </Text>
                </View>
            </View>
            <Text className="text-xs text-rove-charcoal/70 italic text-center max-w-[220px] mt-8">
                {current.type} fits your body's rhythm today
            </Text>
        </View>
    );
}
