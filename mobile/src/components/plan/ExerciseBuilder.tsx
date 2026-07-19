import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { phaseThemes } from '../../data/home-content';
import { generateRoveCoachPlan } from '../../lib/api';

export function ExerciseBuilder({ phase }: { phase: string }) {
    const theme = phaseThemes[phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    const [setting, setSetting] = useState<"Home" | "Gym" | null>(null);
    const [focus, setFocus] = useState<"Full Body" | "Upper Body" | "Lower Body" | "Cardio" | "Core" | "Mobility">("Full Body");
    const [symptoms, setSymptoms] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Session State
    const [sessionMode, setSessionMode] = useState(false);
    const [completedSets, setCompletedSets] = useState<Record<number, boolean>>({});
    const [sessionTimer, setSessionTimer] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (sessionMode) {
            interval = setInterval(() => setSessionTimer(t => t + 1), 1000);
        } else {
            setSessionTimer(0);
        }
        return () => clearInterval(interval);
    }, [sessionMode]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleGenerate = async () => {
        if (!setting) return;
        setIsGenerating(true);
        setResult(null);
        try {
            const plan = await generateRoveCoachPlan(
                phase,
                "Medium",
                `${focus} workout`,
                setting === "Home" ? "Bodyweight / Mat" : "Full Gym",
                symptoms,
                "Intermediate",
                focus,
                "30m"
            );
            setResult(plan);
        } catch (e) {
            Alert.alert("Error", "Could not generate plan");
        } finally {
            setIsGenerating(false);
        }
    };

    const saveSession = async () => {
        if (!result) return;
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const today = new Date().toISOString().split('T')[0];

            const { error: sessionError } = await supabase
                .from('workout_sessions')
                .insert({
                    user_id: user.id,
                    date: today,
                    phase,
                    setting,
                    focus,
                    duration_seconds: sessionTimer,
                    exercises_total: result.main_set?.length || 0,
                    exercises_completed: Object.values(completedSets).filter(Boolean).length,
                    plan_title: result.title,
                    plan_intensity: result.intensity,
                    plan_reasoning: result.reasoning,
                    warmup: result.warmup,
                    cooldown: result.cooldown,
                })
                .select('id')
                .single();

            if (sessionError) throw sessionError;
            setSaved(true);
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", "Could not save workout.");
        } finally {
            setIsSaving(false);
            setSessionMode(false);
        }
    };

    const completedCount = Object.values(completedSets).filter(Boolean).length;
    const totalExercises = result?.main_set?.length || 0;

    // ── Session Mode ──
    if (sessionMode && result) {
        return (
            <View>
                {/* Session Header */}
                <View className="flex-row justify-between items-center mb-5 p-4 rounded-[18px] bg-white/40 border border-white/50">
                    <View className="flex-1">
                        <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Live Session</Text>
                        <Text className="font-bold text-base text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                            {result.title}
                        </Text>
                    </View>
                    <View className="px-4 py-2 rounded-[14px] items-center" style={{ backgroundColor: `${theme.color}15` }}>
                        <View className="flex-row items-center">
                            <Feather name="clock" size={12} color={theme.color} />
                            <Text className="font-bold ml-1.5 text-sm" style={{ color: theme.color, fontVariant: ['tabular-nums'] }}>{formatTime(sessionTimer)}</Text>
                        </View>
                        <Text className="text-[8px] font-bold uppercase tracking-widest text-rove-stone mt-0.5">
                            {completedCount}/{totalExercises} done
                        </Text>
                    </View>
                </View>

                {/* Warmup */}
                {result.warmup?.length > 0 && (
                    <View className="mb-5">
                        <Text className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.color }}>
                            ✦ Warmup
                        </Text>
                        {result.warmup.map((item: string, i: number) => (
                            <View key={i} className="flex-row items-center py-1.5">
                                <View className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ backgroundColor: theme.color, opacity: 0.5 }} />
                                <Text className="text-[13px] text-rove-charcoal">{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Main Circuit */}
                <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>
                    ✦ Main Circuit
                </Text>
                {result.main_set?.map((ex: any, i: number) => {
                    const isDone = completedSets[i];
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setCompletedSets(p => ({ ...p, [i]: !p[i] }))}
                            activeOpacity={0.7}
                            className="mb-2.5"
                        >
                            <View className={`p-4 rounded-[16px] flex-row items-center border ${isDone ? 'bg-white/20 border-white/30' : 'bg-white/50 border-white/60'}`}
                                style={isDone ? {} : { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                                {/* Checkbox */}
                                <View className={`w-7 h-7 rounded-full border-2 items-center justify-center mr-3.5 ${isDone ? 'border-transparent' : 'border-rove-stone/25'}`}
                                    style={isDone ? { backgroundColor: theme.color } : {}}>
                                    {isDone && <Feather name="check" size={14} color="white" />}
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold text-[13px] ${isDone ? 'text-rove-stone line-through' : 'text-rove-charcoal'}`}
                                        style={isDone ? { textDecorationLine: 'line-through' } : {}}>
                                        {ex.name}
                                    </Text>
                                    <Text className={`text-[11px] mt-0.5 ${isDone ? 'text-rove-stone/40' : 'text-rove-stone'}`}>
                                        {ex.sets} sets × {ex.reps} reps
                                    </Text>
                                </View>
                                {!isDone && (
                                    <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${theme.color}10` }}>
                                        <Text className="text-[9px] font-bold" style={{ color: theme.color }}>TAP</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Cooldown */}
                {result.cooldown?.length > 0 && (
                    <View className="mt-4 mb-2">
                        <Text className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.color }}>
                            ✦ Cooldown
                        </Text>
                        {result.cooldown.map((item: string, i: number) => (
                            <View key={i} className="flex-row items-center py-1.5">
                                <View className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ backgroundColor: theme.color, opacity: 0.5 }} />
                                <Text className="text-[13px] text-rove-charcoal">{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                    onPress={saveSession}
                    disabled={isSaving}
                    className="mt-5 py-4 rounded-[16px] items-center justify-center flex-row"
                    style={{ backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                >
                    {isSaving ? <ActivityIndicator color="white" /> : (
                        <>
                            <Feather name="check-circle" size={16} color="white" />
                            <Text className="text-white font-bold ml-2 text-[13px]">Finish & Save Workout</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    // ── Result View ──
    if (result) {
        return (
            <View>
                {/* Title + Refresh */}
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-3">
                        <Text className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.color }}>AI Generated Plan</Text>
                        <Text className="font-bold text-xl text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{result.title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setResult(null)} className="w-9 h-9 rounded-full items-center justify-center bg-white/50 border border-white/60">
                        <Feather name="refresh-ccw" size={14} color="#A8A29E" />
                    </TouchableOpacity>
                </View>

                {/* Reasoning */}
                <Text className="text-[12px] text-rove-stone leading-5 mb-4 italic">"{result.reasoning}"</Text>

                {/* Badges */}
                <View className="flex-row mb-5">
                    <View className="px-3 py-1.5 rounded-full border border-white/60 bg-white/40 mr-2 flex-row items-center">
                        <Feather name="clock" size={10} color="#78716C" style={{ marginRight: 4 }} />
                        <Text className="text-[10px] font-bold text-rove-charcoal uppercase tracking-widest">{result.duration}</Text>
                    </View>
                    <View className="px-3 py-1.5 rounded-full border border-white/60 bg-white/40 flex-row items-center">
                        <Feather name="zap" size={10} color="#78716C" style={{ marginRight: 4 }} />
                        <Text className="text-[10px] font-bold text-rove-charcoal uppercase tracking-widest">{result.intensity}</Text>
                    </View>
                </View>

                {/* Warmup */}
                {result.warmup?.length > 0 && (
                    <View className="mb-5 p-4 rounded-[16px] bg-white/30 border border-white/40">
                        <Text className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: theme.color }}>✦ Warmup</Text>
                        {result.warmup.map((item: string, i: number) => (
                            <View key={i} className="flex-row items-center py-1">
                                <View className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ backgroundColor: theme.color, opacity: 0.5 }} />
                                <Text className="text-[12px] text-rove-charcoal">{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Main Circuit */}
                <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>
                    ✦ Main Circuit · {totalExercises} exercises
                </Text>
                {result.main_set?.map((ex: any, i: number) => (
                    <View key={i} className="flex-row items-center p-3.5 mb-2 rounded-[14px] bg-white/40 border border-white/50">
                        <View className="w-7 h-7 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.color}15` }}>
                            <Text className="text-[10px] font-bold" style={{ color: theme.color }}>{i + 1}</Text>
                        </View>
                        <Text className="text-[13px] font-bold text-rove-charcoal flex-1">{ex.name}</Text>
                        <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${theme.color}10` }}>
                            <Text className="text-[10px] font-bold" style={{ color: theme.color }}>{ex.sets}×{ex.reps}</Text>
                        </View>
                    </View>
                ))}

                {/* Start Session CTA */}
                <TouchableOpacity
                    onPress={() => setSessionMode(true)}
                    className="mt-5 py-4 rounded-[16px] items-center justify-center flex-row"
                    style={{ backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                >
                    <Feather name="play" size={16} color="white" />
                    <Text className="text-white font-bold ml-2 text-[13px]">Start Session</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Builder View ──
    return (
        <View>
            {/* Setting Selector */}
            <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>Where are you working out?</Text>
            <View className="flex-row gap-3 mb-6">
                {([
                    { id: 'Home' as const, icon: 'home' as const, emoji: '🏠' },
                    { id: 'Gym' as const, icon: 'server' as const, emoji: '🏋️' }
                ]).map(opt => {
                    const isSelected = setting === opt.id;
                    return (
                        <TouchableOpacity
                            key={opt.id}
                            onPress={() => setSetting(opt.id)}
                            activeOpacity={0.7}
                            className="flex-1"
                        >
                            <View className={`p-4 rounded-[18px] border items-center ${isSelected ? 'border-white/60 bg-white/50' : 'border-white/30 bg-white/20'}`}
                                style={isSelected ? { shadowColor: theme.color, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } } : {}}>
                                <Text className="text-xl mb-2">{opt.emoji}</Text>
                                <Text className={`font-bold text-xs ${isSelected ? 'text-rove-charcoal' : 'text-rove-stone'}`}>{opt.id}</Text>
                                {isSelected && (
                                    <View className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: theme.color }} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Focus Pills */}
            <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>Focus Area</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" style={{ marginHorizontal: -4 }}>
                {(["Full Body", "Upper Body", "Lower Body", "Cardio", "Core", "Mobility"] as const).map(f => {
                    const isSelected = focus === f;
                    return (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFocus(f as any)}
                            className="mx-1"
                        >
                            <View className={`px-4 py-2.5 rounded-full border ${isSelected ? 'border-transparent' : 'border-white/40 bg-white/30'}`}
                                style={isSelected ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}}>
                                <Text className={`font-bold text-[11px] ${isSelected ? 'text-white' : 'text-rove-stone'}`}>{f}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Symptoms Input */}
            <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>Any symptoms?</Text>
            <TextInput
                value={symptoms}
                onChangeText={setSymptoms}
                placeholder="e.g. lower back pain, cramps, low energy..."
                placeholderTextColor="#C4B5A8"
                className="bg-white/30 border border-white/40 rounded-[16px] p-4 text-rove-charcoal text-[13px] leading-5 mb-6"
                multiline
                numberOfLines={2}
                style={{ minHeight: 56 }}
            />

            {/* Generate CTA */}
            <TouchableOpacity
                onPress={handleGenerate}
                disabled={!setting || isGenerating}
                className="py-4 rounded-[16px] items-center justify-center flex-row"
                style={{
                    backgroundColor: !setting || isGenerating ? '#D6D3D1' : theme.color,
                    shadowColor: !setting || isGenerating ? '#000' : theme.color,
                    shadowOpacity: !setting ? 0 : 0.3,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 }
                }}
            >
                {isGenerating ? <ActivityIndicator color="white" /> : (
                    <>
                        <Feather name="zap" size={16} color="white" />
                        <Text className="text-white font-bold ml-2 text-[13px]">Generate Coach Plan</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}
