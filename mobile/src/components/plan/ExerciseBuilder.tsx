import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert, Modal, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { phaseThemes } from '../../data/home-content';
import { generateRoveCoachPlan } from '../../lib/api';
import { fetchWorkoutChoiceContext } from '../../lib/workoutChoices';
import { mapActivityToFitnessLevel, mapGoalToCoachGoal } from '../../lib/exercisePersonalization';
import { AIGeneratingIndicator } from './AIGeneratingIndicator';
import { WorkoutHistory } from './WorkoutHistory';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CharLimitIndicator, MAX_PROMPT_CHARS, MAX_PROMPTS_PER_SESSION, PromptCountIndicator } from '../ui/PromptLimitIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COACH_LOADING_MESSAGES = [
    'Reading your cycle data...',
    'Matching intensity to your phase...',
    'Checking your equipment & limits...',
    'Building your set...',
];

const EXERCISE_PROMPT_COUNT_KEY = "rove_exercise_prompt_count";
const EXERCISE_LAST_PREFS_KEY = "rove_exercise_last_prefs";
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function ExerciseBuilder({
    phase,
    openSignal,
    activityLevel,
    fitnessGoal,
    defaultDuration,
}: {
    phase: string;
    openSignal?: number;
    /** Real profile data (user_lifestyle) — drives the AI prompt's fitness
     * level and goal instead of the previous hardcoded "Intermediate" /
     * focus-area-as-goal values. */
    activityLevel?: string | null;
    fitnessGoal?: string | null;
    /** The phase's activity-scaled duration (e.g. "45m"), same number shown
     * on the Move tab's orb — falls back to "30m" if not provided. */
    defaultDuration?: string;
}) {
    const theme = phaseThemes[phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    // RN's native <Modal> renders in a separate native window on iOS, and
    // SafeAreaView's auto-detected insets are unreliable there (often report
    // 0, clipping content under the status bar/notch) — fall back to a
    // guaranteed minimum so the close button never ends up off-screen.
    const insets = useSafeAreaInsets();
    const modalTopInset = Math.max(insets.top, 44);

    const [setting, setSetting] = useState<"Home" | "Gym" | null>(null);
    const [focus, setFocus] = useState<"Full Body" | "Upper Body" | "Lower Body" | "Cardio" | "Core" | "Mobility">("Full Body");
    const [symptoms, setSymptoms] = useState("");
    // Real, asked-each-time signal instead of the previous hardcoded "Medium"
    // — the AI prompt's safety rule (low energy → intensity must be Low) only
    // means something if this reflects how the person actually feels today.
    const [energyLevel, setEnergyLevel] = useState<"Low" | "Medium" | "High">("Medium");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Generation limit state
    const [generationCount, setGenerationCount] = useState(0);

    // Session State
    const [sessionMode, setSessionMode] = useState(false);
    const [completedSets, setCompletedSets] = useState<Record<number, boolean>>({});
    const [sessionTimer, setSessionTimer] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Once the user actually engages (opens the builder or has a plan to
    // resume), Rove Coach takes over the full screen instead of competing for
    // attention inside the Move tab's card — a compact teaser is all that
    // shows until then.
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Which pane the fullscreen takeover shows — lets people flip to Session
    // Log (History/Insights) without closing the coach and losing their spot.
    const [fullscreenTab, setFullscreenTab] = useState<"coach" | "history">("coach");

    useEffect(() => {
        const loadPromptCount = async () => {
            try {
                const stored = await AsyncStorage.getItem(EXERCISE_PROMPT_COUNT_KEY);
                if (stored) {
                    const { count, timestamp } = JSON.parse(stored);
                    if (Date.now() - timestamp < STORAGE_EXPIRY_MS) {
                        setGenerationCount(count || 0);
                        return;
                    }
                    await AsyncStorage.removeItem(EXERCISE_PROMPT_COUNT_KEY);
                }
            } catch {}
        };
        loadPromptCount();
    }, []);

    // Restore the user's last Where/Focus picks so re-opening the builder
    // doesn't force her to re-pick a setting every single time.
    useEffect(() => {
        const loadLastPrefs = async () => {
            try {
                const stored = await AsyncStorage.getItem(EXERCISE_LAST_PREFS_KEY);
                if (stored) {
                    const prefs = JSON.parse(stored);
                    if (prefs.setting) setSetting(prefs.setting);
                    if (prefs.focus) setFocus(prefs.focus);
                }
            } catch {}
        };
        loadLastPrefs();
    }, []);

    // The floating Rove Coach button on the orb bumps this to jump straight
    // into the fullscreen builder instead of just scrolling to the card.
    useEffect(() => {
        if (openSignal) setIsFullscreen(true);
    }, [openSignal]);

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

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsGenerating(true);
        setResult(null);

        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        try {
            await AsyncStorage.setItem(EXERCISE_PROMPT_COUNT_KEY, JSON.stringify({ count: newCount, timestamp: Date.now() }));
        } catch {}

        try {
            const { recentChosen, preferenceSummary } = await fetchWorkoutChoiceContext();
            const plan = await generateRoveCoachPlan(
                phase,
                energyLevel,
                mapGoalToCoachGoal(fitnessGoal),
                setting === "Home" ? "Bodyweight / Mat" : "Full Gym",
                symptoms,
                mapActivityToFitnessLevel(activityLevel),
                focus,
                defaultDuration || "30m",
                recentChosen,
                preferenceSummary
            );
            setResult(plan);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
                await AsyncStorage.setItem(EXERCISE_LAST_PREFS_KEY, JSON.stringify({ setting, focus }));
            } catch {}
        } catch (e) {
            Alert.alert("Error", "Could not generate plan");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

            const parseNum = (val: any): number => {
                if (!val) return 0;
                const match = String(val).match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };

            const exerciseRows = result.main_set?.map((ex: any, i: number) => ({
                user_id: user.id,
                workout_session_id: session.id,
                exercise_name: ex.name,
                date: today,
                sets_completed: completedSets[i] ? parseNum(ex.sets) : 0,
                reps_completed: completedSets[i] ? parseNum(ex.reps) : 0,
                completed: !!completedSets[i],
            })) || [];

            if (exerciseRows.length > 0) {
                const { error: exerciseError } = await supabase.from('exercise_history').insert(exerciseRows);
                if (exerciseError) throw exerciseError;
            }

            setSaved(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", "Could not save workout.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSaving(false);
            setSessionMode(false);
        }
    };

    const toggleSet = (i: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCompletedSets(p => ({ ...p, [i]: !p[i] }));
    };

    const completedCount = Object.values(completedSets).filter(Boolean).length;
    const totalExercises = result?.main_set?.length || 0;
    const hasData = !!result;

    const openBuilder = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsFullscreen(true);
    };

    return (
        <View>
            {hasData ? (
                /* ── Resume teaser: a plan already exists from a previous session, ── */
                /* just re-open the fullscreen view rather than starting over.      */
                <Animated.View key="resume" entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)}>
                    <TouchableOpacity
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsFullscreen(true); }}
                        activeOpacity={0.85}
                        className="flex-row items-center bg-white/70 rounded-[16px] border border-white p-4"
                        style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
                    >
                        <View
                            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: theme.color }}
                        >
                            <Feather name={sessionMode ? 'play' : 'clipboard'} size={17} color="white" />
                        </View>
                        <View className="flex-1 mr-2">
                            <Text
                                className="font-bold text-base text-rove-charcoal"
                                style={{ fontFamily: 'CormorantGaramond-Regular' }}
                                numberOfLines={1}
                            >
                                {result.title}
                            </Text>
                            <Text className="text-[12px] text-rove-stone" numberOfLines={1}>
                                {totalExercises} exercises · {result.duration}
                            </Text>
                        </View>
                        {sessionMode ? (
                            <View className="px-2 py-0.5 rounded-full flex-row items-center mr-2" style={{ backgroundColor: `${theme.color}12` }}>
                                <Feather name="clock" size={10} color={theme.color} />
                                <Text className="text-[9px] font-bold ml-1" style={{ color: theme.color, fontVariant: ['tabular-nums'] }}>{formatTime(sessionTimer)}</Text>
                            </View>
                        ) : null}
                        <Feather name="chevron-right" size={18} color="#A8A29E" />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                /* ── Empty state ── */
                <Animated.View key="empty" entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)} className="items-center py-4">
                    <View className="px-3 py-1.5 rounded-lg border border-rove-stone/10 mb-4" style={{ backgroundColor: `${theme.color}05` }}>
                        <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Optimized for: {phase}</Text>
                    </View>
                    <View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 20,
                            backgroundColor: theme.color,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                            shadowColor: theme.color,
                            shadowOpacity: 0.25,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 5 },
                        }}
                    >
                        <Feather name="zap" size={22} color="white" />
                    </View>
                    <Text className="font-bold text-2xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Regular' }}>Ready to move?</Text>
                    <Text className="text-sm text-rove-stone mb-6 text-center px-4">
                        Tell Rove Coach your setting, focus, and how you're feeling.
                    </Text>
                    <TouchableOpacity
                        onPress={openBuilder}
                        className="w-full py-4 rounded-[16px] items-center justify-center flex-row shadow-lg"
                        style={{ backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
                    >
                        <Feather name="zap" size={16} color="white" />
                        <Text className="text-white font-bold ml-2 text-[14px]">Build My Workout</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* ── Fullscreen takeover: once Coach is actually in use, it becomes ── */}
            {/* the centerpiece — everything else (other Move sections) is       */}
            {/* hidden behind this native modal layer. The Coach/History toggle  */}
            {/* below keeps Session Log (History + Insights) reachable without   */}
            {/* forcing people to close the modal first.                        */}
            <Modal
                visible={isFullscreen}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setIsFullscreen(false)}
            >
                <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
                    <LinearGradient
                        colors={[`${theme.color}14`, 'transparent']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View className="flex-row items-center justify-between px-5 pb-4" style={{ paddingTop: modalTopInset }}>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsFullscreen(false);
                            }}
                            className="w-9 h-9 rounded-full items-center justify-center bg-white"
                            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
                        >
                            <Feather name="x" size={16} color={theme.color} />
                        </TouchableOpacity>
                        <Text className="text-[11px] font-bold uppercase tracking-widest text-rove-charcoal">Rove Coach</Text>
                        <View className="w-9" />
                    </View>

                    <View className="flex-row bg-white/40 p-1 rounded-xl border border-white/60 mx-5 mb-4" style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                        <Pressable
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenTab('coach'); }}
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(fullscreenTab === 'coach' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                        >
                            <Feather name="zap" size={13} color={fullscreenTab === 'coach' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                            <Text className={`text-[11px] font-bold ${fullscreenTab === 'coach' ? 'text-white' : 'text-rove-stone'}`}>Workout Coach</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullscreenTab('history'); }}
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(fullscreenTab === 'history' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                        >
                            <Feather name="bar-chart-2" size={13} color={fullscreenTab === 'history' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                            <Text className={`text-[11px] font-bold ${fullscreenTab === 'history' ? 'text-white' : 'text-rove-stone'}`}>Session Log</Text>
                        </Pressable>
                    </View>

                    {fullscreenTab === 'history' ? (
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <WorkoutHistory phase={phase} />
                        </ScrollView>
                    ) : (
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {sessionMode && result ? (
                            /* ── Session Mode ── */
                            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut} layout={Layout}>
                                {/* Session Header */}
                                <View className="flex-row justify-between items-center mb-5 p-4 rounded-[18px] bg-white/60 border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                                    <View className="flex-1">
                                        <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Live Session</Text>
                                        <Text className="font-bold text-base text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                                            {result.title}
                                        </Text>
                                    </View>
                                    <View className="px-4 py-2 rounded-[14px] items-center" style={{ backgroundColor: `${theme.color}20` }}>
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
                                            <View key={i} className="flex-row items-center py-2 px-3 mb-1.5 rounded-[12px] bg-white/40 border border-white/50">
                                                <View className="w-5 h-5 rounded-full items-center justify-center mr-3" style={{ backgroundColor: theme.color }}>
                                                    <Text className="text-[9px] font-bold text-white">{i + 1}</Text>
                                                </View>
                                                <Text className="text-[13px] text-rove-charcoal flex-1">{item}</Text>
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
                                            onPress={() => toggleSet(i)}
                                            activeOpacity={0.7}
                                            className="mb-2.5"
                                        >
                                            <View className={`p-4 rounded-[16px] border transition-all ${isDone ? 'bg-white/30 border-white/40' : 'bg-white/80 border-white shadow-sm'}`}
                                                style={isDone ? {} : { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>

                                                <View className="flex-row items-start justify-between">
                                                    <View className="flex-1 pr-3">
                                                        <Text className={`font-bold text-[14px] ${isDone ? 'text-rove-stone line-through' : 'text-rove-charcoal'}`}
                                                            style={isDone ? { textDecorationLine: 'line-through' } : {}}>
                                                            {ex.name}
                                                        </Text>
                                                        <View className="flex-row gap-2 mt-1.5">
                                                            <View className="bg-stone-100/80 px-2 py-0.5 rounded flex-row items-center">
                                                                <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-rove-stone/50' : 'text-rove-stone'}`}>
                                                                    {ex.sets} Sets
                                                                </Text>
                                                            </View>
                                                            <View className="bg-stone-100/80 px-2 py-0.5 rounded flex-row items-center">
                                                                <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-rove-stone/50' : 'text-rove-stone'}`}>
                                                                    {ex.reps} Reps
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    {/* Checkbox */}
                                                    <View className={`w-7 h-7 rounded-full border-2 items-center justify-center mt-1 ${isDone ? 'border-transparent' : 'border-rove-stone/25'}`}
                                                        style={isDone ? { backgroundColor: '#22c55e' } : {}}>
                                                        {isDone && <Feather name="check" size={14} color="white" />}
                                                    </View>
                                                </View>

                                                {ex.notes && !isDone && (
                                                    <View className="mt-3 bg-[#EFF6FF] border border-[#DBEAFE] p-2.5 rounded-xl flex-row items-start">
                                                        <Feather name="info" size={14} color="#3B82F6" style={{ marginTop: 1, marginRight: 6 }} />
                                                        <Text className="text-[11px] text-[#1D4ED8] flex-1">{ex.notes}</Text>
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
                                            <View key={i} className="flex-row items-center py-2 px-3 mb-1.5 rounded-[12px] bg-white/40 border border-white/50">
                                                <View className="w-5 h-5 rounded-full items-center justify-center mr-3" style={{ backgroundColor: theme.color, opacity: 0.6 }}>
                                                    <Text className="text-[9px] font-bold text-white">{i + 1}</Text>
                                                </View>
                                                <Text className="text-[13px] text-rove-charcoal flex-1">{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Save Button */}
                                <TouchableOpacity
                                    onPress={saveSession}
                                    disabled={isSaving}
                                    className="mt-4 py-4 rounded-[16px] items-center justify-center flex-row shadow-lg"
                                    style={{ backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
                                >
                                    {isSaving ? <ActivityIndicator color="white" /> : (
                                        <>
                                            <Feather name="check-circle" size={16} color="white" />
                                            <Text className="text-white font-bold ml-2 text-[14px]">Finish & Save Workout</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ) : result ? (
                            /* ── Result View ── */
                            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut} layout={Layout}>
                                {/* Title + Refresh */}
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.color }}>AI Generated Plan</Text>
                                        <Text className="font-bold text-xl text-rove-charcoal leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{result.title}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setResult(null)} className="w-9 h-9 rounded-full items-center justify-center bg-white/70 border border-white shadow-sm">
                                        <Feather name="refresh-ccw" size={14} color="#A8A29E" />
                                    </TouchableOpacity>
                                </View>

                                {/* Reasoning */}
                                {result.reasoning && (
                                    <View className="mb-4 bg-white/60 p-4 rounded-xl border border-white flex-row overflow-hidden">
                                        <View className="w-1 absolute left-0 top-0 bottom-0 opacity-40" style={{ backgroundColor: theme.color }} />
                                        <Text className="text-[12px] text-rove-stone leading-5 italic ml-2">"{result.reasoning}"</Text>
                                    </View>
                                )}

                                {/* Badges */}
                                <View className="flex-row mb-5">
                                    <View className="px-3 py-1.5 rounded-full border border-white shadow-sm bg-white mr-2 flex-row items-center">
                                        <Feather name="clock" size={10} color="#78716C" style={{ marginRight: 4 }} />
                                        <Text className="text-[10px] font-bold text-rove-charcoal uppercase tracking-widest">{result.duration}</Text>
                                    </View>
                                    <View className="px-3 py-1.5 rounded-full border border-white/60 bg-white mr-2 flex-row items-center shadow-sm" style={{ backgroundColor: `${theme.color}15` }}>
                                        <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>{result.intensity} Intensity</Text>
                                    </View>
                                </View>

                                {/* Warmup */}
                                {result.warmup?.length > 0 && (
                                    <View className="mb-5 p-4 rounded-[16px] bg-white/50 border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                        <Text className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: theme.color }}>✦ Warmup</Text>
                                        {result.warmup.map((item: string, i: number) => (
                                            <View key={i} className="flex-row items-center py-1.5">
                                                <View className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ backgroundColor: theme.color, opacity: 0.5 }} />
                                                <Text className="text-[12px] text-rove-charcoal leading-snug">{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Main Circuit */}
                                <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>
                                    ✦ Main Circuit · {totalExercises} exercises
                                </Text>
                                {result.main_set?.map((ex: any, i: number) => (
                                    <View key={i} className="flex-row items-center p-3.5 mb-2 rounded-[14px] bg-white/70 border border-white shadow-sm">
                                        <View className="w-7 h-7 rounded-full items-center justify-center mr-3" style={{ backgroundColor: theme.color }}>
                                            <Text className="text-[10px] font-bold text-white">{i + 1}</Text>
                                        </View>
                                        <Text className="text-[13px] font-bold text-rove-charcoal flex-1">{ex.name}</Text>
                                        <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${theme.color}10` }}>
                                            <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.color }}>{ex.sets}×{ex.reps}</Text>
                                        </View>
                                    </View>
                                ))}

                                {/* Start Session CTA */}
                                <TouchableOpacity
                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSessionMode(true); }}
                                    className="mt-5 py-4 rounded-[16px] items-center justify-center flex-row shadow-lg"
                                    style={{ backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
                                >
                                    <Feather name="play" size={16} color="white" style={{ fill: 'white' } as any} />
                                    <Text className="text-white font-bold ml-2 text-[14px]">Start Guided Session</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            /* ── Builder View ── */
                            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut} layout={Layout}>
                                {/* Setting Selector */}
                                <Text className="text-[10px] font-bold uppercase tracking-widest mb-3 flex-row items-center text-rove-stone">
                                    Where?
                                </Text>
                                <View className="flex-row gap-3 mb-6">
                {([
                    { id: 'Home' as const, icon: 'home' as const },
                    { id: 'Gym' as const, icon: 'server' as const }
                ]).map(opt => {
                    const isSelected = setting === opt.id;
                    return (
                        <TouchableOpacity
                            key={opt.id}
                            onPress={() => { Haptics.selectionAsync(); setSetting(opt.id); }}
                            activeOpacity={0.7}
                            className={`flex-1 p-3.5 rounded-[16px] border flex-row items-center justify-center`}
                            style={isSelected ? { 
                                backgroundColor: 'white',
                                borderColor: 'white',
                                shadowColor: theme.color, 
                                shadowOpacity: 0.1, 
                                shadowRadius: 8, 
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 2
                            } : {
                                backgroundColor: 'rgba(255,255,255,0.4)',
                                borderColor: 'rgba(255,255,255,0.6)'
                            }}
                        >
                            <Feather name={opt.icon} size={14} color={isSelected ? theme.color : '#2D2420'} style={{ opacity: isSelected ? 1 : 0.7 }} />
                            <Text className="font-bold text-[13px] ml-2 text-rove-charcoal">{opt.id}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Focus Pills */}
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-3 flex-row items-center text-rove-stone">
                Focus Area
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" style={{ marginHorizontal: -4 }}>
                {(["Full Body", "Upper Body", "Lower Body", "Cardio", "Core", "Mobility"] as const).map(f => {
                    const isSelected = focus === f;
                    return (
                        <TouchableOpacity
                            key={f}
                            onPress={() => { Haptics.selectionAsync(); setFocus(f as any); }}
                            className="mx-1"
                        >
                            <View className={`px-4 py-2.5 rounded-full border`}
                                style={isSelected ? { 
                                    backgroundColor: 'white', 
                                    borderColor: 'transparent',
                                    shadowColor: theme.color, 
                                    shadowOpacity: 0.1, 
                                    shadowRadius: 6, 
                                    shadowOffset: { width: 0, height: 2 },
                                    elevation: 2
                                } : {
                                    backgroundColor: 'rgba(255,255,255,0.4)',
                                    borderColor: 'rgba(255,255,255,0.4)'
                                }}>
                                <Text className="font-bold text-[12px] text-rove-charcoal">{f}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

                                {/* Energy Level — real signal instead of a hardcoded "Medium",
                                    since the AI plan's intensity is safety-gated on this. */}
                                <Text className="text-[10px] font-bold uppercase tracking-widest mb-3 flex-row items-center text-rove-stone">
                                    How's your energy today?
                                </Text>
                                <View className="flex-row gap-3 mb-6">
                                    {(["Low", "Medium", "High"] as const).map(level => {
                                        const isSelected = energyLevel === level;
                                        return (
                                            <TouchableOpacity
                                                key={level}
                                                onPress={() => { Haptics.selectionAsync(); setEnergyLevel(level); }}
                                                activeOpacity={0.7}
                                                className="flex-1 p-3 rounded-[16px] border items-center justify-center"
                                                style={isSelected ? {
                                                    backgroundColor: 'white',
                                                    borderColor: 'white',
                                                    shadowColor: theme.color,
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 8,
                                                    shadowOffset: { width: 0, height: 4 },
                                                    elevation: 2
                                                } : {
                                                    backgroundColor: 'rgba(255,255,255,0.4)',
                                                    borderColor: 'rgba(255,255,255,0.6)'
                                                }}
                                            >
                                                <Text className="font-bold text-[13px] text-rove-charcoal">{level}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Symptoms Input */}
                                <Text className="text-[10px] font-bold uppercase tracking-widest mb-3 flex-row items-center text-rove-stone">
                                    Anything to keep in mind?
                                </Text>
                                <TextInput
                                    value={symptoms}
                                    onChangeText={setSymptoms}
                                    placeholder="e.g. cramps, sore knees..."
                                    placeholderTextColor="#A8A29E"
                                    className="bg-white/60 border border-white/80 rounded-[16px] p-4 text-rove-charcoal text-[14px] leading-5 mb-6 font-medium"
                                    style={{ minHeight: 56, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
                                />

                                {/* Generate CTA */}
                                <TouchableOpacity
                                    onPress={handleGenerate}
                                    disabled={!setting || isGenerating}
                                    className="py-4 rounded-[16px] items-center justify-center flex-row shadow-lg"
                                    style={{
                                        backgroundColor: !setting || isGenerating ? '#D6D3D1' : theme.color,
                                        shadowColor: !setting || isGenerating ? '#000' : theme.color,
                                        shadowOpacity: !setting ? 0 : 0.3,
                                        shadowRadius: 10,
                                        shadowOffset: { width: 0, height: 4 }
                                    }}
                                >
                                    {isGenerating ? <ActivityIndicator color="white" /> : (
                                        <>
                                            <Feather name="zap" size={16} color="white" />
                                            <Text className="text-white font-bold ml-2 text-[14px]">Generate AI Plan</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {isGenerating && (
                                    <View className="mt-4">
                                        <AIGeneratingIndicator color={theme.color} messages={COACH_LOADING_MESSAGES} />
                                    </View>
                                )}
                            </Animated.View>
                        )}
                    </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}
