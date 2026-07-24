import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Activity, BicepsFlexed, Footprints, HeartPulse, Zap, Brain } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { phaseThemes } from '../../data/home-content';
import { generateRoveCoachPlan } from '../../lib/api';

// Ported 1:1 from frontend/src/components/cycle-sync/ExerciseBuilder.tsx's
// Focus Area grid (lines 399-406) — same icon-per-focus mapping and 3-column
// grid layout, selected state (white bg + phase-colored border/icon/text)
// matching that file's `theme.active` styling instead of a solid color fill.
const FOCUS_OPTIONS: { id: "Full Body" | "Upper Body" | "Lower Body" | "Cardio" | "Core" | "Mobility"; label: string; Icon: any }[] = [
    { id: "Full Body", label: "Full Body", Icon: Activity },
    { id: "Upper Body", label: "Upper", Icon: BicepsFlexed },
    { id: "Lower Body", label: "Lower", Icon: Footprints },
    { id: "Cardio", label: "Cardio", Icon: HeartPulse },
    { id: "Core", label: "Core", Icon: Zap },
    { id: "Mobility", label: "Mobility", Icon: Brain },
];

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

            // 1. Insert workout session
            const { data: session, error: sessionError } = await supabase
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

            // 2. Insert one row per exercise into exercise_history — mirrors
            // the web's ExerciseBuilder.tsx saveSession(), which the phase
            // completion-rate stats (get_phase_workout_stats) are built from.
            const parseNum = (val: any): number => {
                if (!val) return 0;
                const match = String(val).match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };
            const exerciseRows = (result.main_set || []).map((ex: any, i: number) => ({
                user_id: user.id,
                workout_session_id: session.id,
                exercise_name: ex.name,
                date: today,
                sets_completed: completedSets[i] ? parseNum(ex.sets) : 0,
                reps_completed: completedSets[i] ? parseNum(ex.reps) : 0,
                completed: !!completedSets[i],
            }));

            const { error: exerciseError } = await supabase
                .from('exercise_history')
                .insert(exerciseRows);

            if (exerciseError) throw exerciseError;

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

            {/* Focus Area — 2-row × 3-col grid, icon above label, matching
                the web's grid-cols-3 layout and selected-state treatment
                (white card + phase-colored border/icon/text, not a solid fill). */}
            <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>Focus Area</Text>
            <View className="mb-6" style={{ marginHorizontal: -4 }}>
                {[FOCUS_OPTIONS.slice(0, 3), FOCUS_OPTIONS.slice(3, 6)].map((row, rowIdx) => (
                    <View key={rowIdx} className="flex-row" style={{ marginBottom: rowIdx === 0 ? 8 : 0 }}>
                        {row.map((opt) => {
                            const isSelected = focus === opt.id;
                            return (
                                <TouchableOpacity
                                    key={opt.id}
                                    onPress={() => setFocus(opt.id)}
                                    activeOpacity={0.7}
                                    className="flex-1"
                                    style={{ marginHorizontal: 4 }}
                                >
                                    <View
                                        className={`py-3 rounded-xl border items-center ${isSelected ? 'bg-white' : 'border-white/40 bg-white/30'}`}
                                        style={isSelected ? { borderColor: `${theme.color}4D`, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } } : undefined}
                                    >
                                        <opt.Icon size={16} color={isSelected ? theme.color : '#A8A29E'} style={{ marginBottom: 4 }} />
                                        <Text className={`font-bold text-[10px] ${isSelected ? '' : 'text-rove-stone'}`} style={isSelected ? { color: theme.color } : undefined}>
                                            {opt.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>

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
