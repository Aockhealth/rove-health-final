import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import type { ExerciseItem } from '@shared/content/phase-data';
import { supabase } from '../../lib/supabase';

// Same enrichment web's guided session applies (frontend/src/app/cycle-sync/
// plan/[phase]/page.tsx enrichExercises/getFormCues) — ported here rather than
// shared, since it's presentation-only logic with no server dependency.
type SessionExercise = ExerciseItem & {
  seconds?: number;
  sets?: number;
  reps?: number;
  formCues: string[];
};

const REST_SECONDS = 20;

function getFormCues(title: string): string[] {
  const t = title.toLowerCase();
  if (t.includes('push')) return [
    "Keep your core tight — don't let your hips sag",
    'Elbows at ~45° from your body, not flared out',
    'Breathe out on the way up',
  ];
  if (t.includes('wall sit')) return [
    'Back flat against the wall, thighs parallel to floor',
    'Weight evenly on both feet',
    "Hold steady — don't hold your breath",
  ];
  if (t.includes('lunge')) return [
    'Step back far enough that your front knee stays above your ankle',
    'Lower your back knee toward the floor, not forward',
    'Keep chest tall, gaze forward',
  ];
  if (t.includes('yoga') || t.includes('stretch')) return [
    "Breathe into each stretch — don't force it",
    'Never stretch to the point of pain',
  ];
  if (t.includes('plank')) return [
    'Straight line from head to heels',
    'Squeeze your glutes and abs simultaneously',
    'Look just ahead of your hands, neutral neck',
  ];
  return ['Controlled movements — quality over speed', 'Exhale on exertion'];
}

function enrichExercises(items: ExerciseItem[]): SessionExercise[] {
  return items.map((ex) => ({
    ...ex,
    seconds: ex.intensity === 'Low' ? 30 : ex.intensity === 'Moderate' ? 45 : 40,
    sets: ex.intensity === 'Low' ? undefined : 3,
    reps: ex.intensity === 'Low' ? undefined : 12,
    formCues: getFormCues(ex.title),
  }));
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function intensityColor(intensity: string) {
  if (intensity === 'Low') return '#5B9A8B';
  if (intensity === 'High') return '#C0524A';
  return '#C98A3A';
}

// Shared countdown ring for both the exercise timer and the rest screen.
function CountdownRing({ remaining, total, color, size = 96 }: { remaining: number; total: number; color: string; size?: number }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? (total - remaining) / total : 0;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#F3F4F6" strokeWidth={7} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </Svg>
      <View style={StyleSheet.absoluteFillObject} className="items-center justify-center">
        <Text className="text-2xl font-bold tabular-nums text-rove-charcoal">
          {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
        </Text>
      </View>
    </View>
  );
}

function RestScreen({ onDone, accentColor }: { onDone: () => void; accentColor: string }) {
  const [remaining, setRemaining] = useState(REST_SECONDS);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="items-center py-10" style={{ gap: 20 }}>
      <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">Rest</Text>
      <CountdownRing remaining={remaining} total={REST_SECONDS} color={accentColor} size={112} />
      <Text className="text-sm text-rove-stone font-medium">Breathe. You're doing great.</Text>
      <TouchableOpacity onPress={onDone}>
        <Text className="text-xs font-bold text-rove-stone underline">Skip Rest</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ExerciseCard({
  exercise,
  index,
  total,
  onNext,
  accentColor,
}: {
  exercise: SessionExercise;
  index: number;
  total: number;
  onNext: () => void;
  accentColor: string;
}) {
  const hasTimer = !!exercise.seconds;
  const [timerActive, setTimerActive] = useState(false);
  const [remaining, setRemaining] = useState(exercise.seconds ?? 0);
  const [cueIndex, setCueIndex] = useState(0);

  useEffect(() => {
    setTimerActive(false);
    setRemaining(exercise.seconds ?? 0);
    setCueIndex(0);
  }, [exercise]);

  useEffect(() => {
    if (!timerActive || !hasTimer) return;
    if (remaining <= 0) {
      setTimerActive(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, remaining, hasTimer]);

  useEffect(() => {
    if (!timerActive || exercise.formCues.length === 0) return;
    const t = setInterval(() => setCueIndex((c) => (c + 1) % exercise.formCues.length), 8000);
    return () => clearInterval(t);
  }, [timerActive, exercise.formCues]);

  const isDone = hasTimer && remaining === 0;

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} layout={Layout} style={{ gap: 16 }}>
      {/* Progress bar */}
      <View className="flex-row" style={{ gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-rove-stone/10">
            <View
              className="h-full rounded-full"
              style={{ width: i < index ? '100%' : i === index ? '50%' : '0%', backgroundColor: accentColor }}
            />
          </View>
        ))}
      </View>

      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-[9px] font-bold uppercase tracking-widest text-rove-stone">
            Exercise {index + 1} of {total}
          </Text>
          <Text className="text-xl text-rove-charcoal mt-0.5" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            {exercise.title}
          </Text>
        </View>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${intensityColor(exercise.intensity)}15` }}>
          <Text className="text-[9px] font-bold" style={{ color: intensityColor(exercise.intensity) }}>{exercise.intensity}</Text>
        </View>
      </View>

      <Text className="text-sm text-rove-charcoal/80 leading-5">{exercise.description}</Text>

      {exercise.formCues.length > 0 && (
        <View className="flex-row items-start p-3 rounded-xl" style={{ backgroundColor: `${accentColor}15`, gap: 8 }}>
          <Feather name="info" size={14} color={accentColor} style={{ marginTop: 1 }} />
          <Text className="text-xs font-medium flex-1" style={{ color: accentColor }}>{exercise.formCues[cueIndex]}</Text>
        </View>
      )}

      {hasTimer ? (
        <View className="items-center py-2" style={{ gap: 12 }}>
          <CountdownRing remaining={remaining} total={exercise.seconds!} color={accentColor} />
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setTimerActive((v) => !v); }}
            className="flex-row items-center px-5 py-2.5 rounded-full"
            style={{ backgroundColor: accentColor, gap: 8 }}
          >
            <Feather name={timerActive ? 'pause' : 'play'} size={14} color="white" />
            <Text className="text-white font-bold text-sm">{timerActive ? 'Pause' : isDone ? 'Done!' : 'Start'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-center justify-center py-3" style={{ gap: 16 }}>
          {exercise.sets && (
            <View className="items-center">
              <Text className="text-2xl font-bold" style={{ color: accentColor }}>{exercise.sets}</Text>
              <Text className="text-[9px] uppercase tracking-wider text-rove-stone">Sets</Text>
            </View>
          )}
          <View className="w-px h-8 bg-rove-stone/15" />
          {exercise.reps && (
            <View className="items-center">
              <Text className="text-2xl font-bold" style={{ color: accentColor }}>{exercise.reps}</Text>
              <Text className="text-[9px] uppercase tracking-wider text-rove-stone">Reps</Text>
            </View>
          )}
          <View className="w-px h-8 bg-rove-stone/15" />
          <View className="items-center">
            <Text className="text-sm font-bold text-rove-charcoal">{exercise.duration}</Text>
            <Text className="text-[9px] uppercase tracking-wider text-rove-stone">Duration</Text>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
        {exercise.benefits.map((b) => (
          <View key={b} className="flex-row items-center px-2 py-1 rounded-full bg-rove-stone/5" style={{ gap: 4 }}>
            <Feather name="check-circle" size={10} color="#5B9A8B" />
            <Text className="text-[9px] text-rove-stone">{b}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNext(); }}
        className="py-3.5 rounded-2xl items-center justify-center"
        style={{ backgroundColor: accentColor }}
      >
        <Text className="text-white font-bold text-sm">{index < total - 1 ? 'Next Exercise →' : 'Complete Session 🎉'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CompleteScreen({ phaseName, onClose, accentColor }: { phaseName: string; onClose: () => void; accentColor: string }) {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  return (
    <Animated.View entering={FadeIn.duration(300)} className="items-center py-10" style={{ gap: 16 }}>
      <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
        <Feather name="check-circle" size={32} color={accentColor} />
      </View>
      <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Session Complete!</Text>
      <Text className="text-sm text-rove-stone text-center px-4">
        You crushed your <Text style={{ fontWeight: '700' }}>{phaseName}</Text> phase workout. Your body thanks you.
      </Text>
      <TouchableOpacity onPress={onClose} className="mt-2 px-6 py-3 rounded-full" style={{ backgroundColor: accentColor }}>
        <Text className="text-white font-bold text-sm">Back to Plan</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function GuidedSessionPlayer({
  visible,
  onClose,
  exercises,
  phaseName,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  exercises: ExerciseItem[];
  phaseName: string;
  accentColor: string;
}) {
  const enriched = useMemo(() => enrichExercises(exercises), [exercises]);
  const [step, setStep] = useState<'exercise' | 'rest' | 'done'>('exercise');
  const [idx, setIdx] = useState(0);
  const startedAtRef = useRef(Date.now());
  const savedRef = useRef(false);

  // Reset to the first exercise every time the player is (re)opened.
  useEffect(() => {
    if (visible) {
      setStep('exercise');
      setIdx(0);
      startedAtRef.current = Date.now();
      savedRef.current = false;
    }
  }, [visible]);

  // Finishing a guided session used to just flip local UI state to the
  // "done" screen with nothing persisted — sessions never showed up in
  // Session Log's History or Insights tabs (which read from these same
  // tables via ExerciseBuilder's saveSession/WorkoutHistory). Mirror that
  // save here so the guided flow actually counts as a completed session.
  useEffect(() => {
    if (step !== 'done' || savedRef.current) return;
    savedRef.current = true;

    const save = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

        const { data: session, error: sessionError } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            date: today,
            phase: phaseName,
            setting: 'Guided Session',
            focus: `${phaseName} Guided Session`,
            duration_seconds: durationSeconds,
            exercises_total: enriched.length,
            exercises_completed: enriched.length,
            plan_title: `${phaseName} Guided Session`,
            plan_intensity: 'Moderate',
            plan_reasoning: 'Phase-recommended guided session.',
            warmup: [],
            cooldown: [],
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;

        const exerciseRows = enriched.map((ex) => ({
          user_id: user.id,
          workout_session_id: session.id,
          exercise_name: ex.title,
          date: today,
          sets_completed: ex.sets ?? 0,
          reps_completed: ex.reps ?? 0,
          completed: true,
        }));

        const { error: exerciseError } = await supabase.from('exercise_history').insert(exerciseRows);
        if (exerciseError) throw exerciseError;
      } catch (err) {
        console.error('Failed to save guided session:', err);
      }
    };

    save();
  }, [step, enriched, phaseName]);

  const goNext = useCallback(() => {
    setStep((s) => {
      if (idx >= enriched.length - 1) return 'done';
      return 'rest';
    });
  }, [idx, enriched.length]);

  const afterRest = useCallback(() => {
    setIdx((i) => i + 1);
    setStep('exercise');
  }, []);

  if (enriched.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
              <Feather name="zap" size={14} color={accentColor} />
            </View>
            <View>
              <Text className="text-[9px] uppercase tracking-widest text-rove-stone font-bold">{phaseName} Phase</Text>
              <Text className="text-sm font-bold text-rove-charcoal">Guided Session</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} className="w-9 h-9 rounded-full items-center justify-center bg-rove-stone/10">
            <Feather name="x" size={16} color="#2D2420" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {step === 'exercise' && (
            <ExerciseCard key={`ex-${idx}`} exercise={enriched[idx]} index={idx} total={enriched.length} onNext={goNext} accentColor={accentColor} />
          )}
          {step === 'rest' && <RestScreen key="rest" onDone={afterRest} accentColor={accentColor} />}
          {step === 'done' && <CompleteScreen key="done" phaseName={phaseName} onClose={onClose} accentColor={accentColor} />}
        </ScrollView>
      </View>
    </Modal>
  );
}
