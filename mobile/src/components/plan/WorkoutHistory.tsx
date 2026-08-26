import React, { useState, useEffect } from 'react';
import { Platform,  View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Dumbbell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { supabase } from '../../lib/supabase';
import { phaseThemes } from '../../data/home-content';
import { getDateLocaleTag } from '../../lib/i18n';
import { getLocalizedFontFamily } from '../../lib/fonts';

interface WorkoutSession {
    id: string;
    date: string;
    phase: string;
    energy_level: string;
    focus: string;
    setting: string;
    duration_seconds: number;
    exercises_total: number;
    exercises_completed: number;
    plan_title: string;
    plan_intensity: string;
    warmup: string[];
    cooldown: string[];
}

interface PhaseStats {
    phase: string;
    completion_rate: number;
    avg_duration: number;
    session_count: number;
}

function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function formatDate(dateStr: string, t: TFunction) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return t('plan.workoutHistory.today');
    if (d.toDateString() === yesterday.toDateString()) return t('plan.workoutHistory.yesterday');
    return d.toLocaleDateString(getDateLocaleTag(), { weekday: "short", month: "short", day: "numeric" });
}

function completionPct(session: WorkoutSession) {
    if (!session.exercises_total) return 0;
    return Math.round((session.exercises_completed / session.exercises_total) * 100);
}

import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';

function SessionCard({ session }: { session: WorkoutSession }) {
    const { t: translate } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const t = phaseThemes[session.phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    const pct = completionPct(session);

    return (
        <Animated.View layout={Layout} className="rounded-[18px] overflow-hidden mb-3 bg-white border border-white/50"
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpanded(!expanded);
                }}
                className="p-4 flex-row"
                activeOpacity={0.7}
            >
                <View className="w-10 h-10 rounded-[14px] items-center justify-center mr-3 border border-white/40"
                    style={{ backgroundColor: `${t.color}15` }}>
                    <Dumbbell size={16} color={t.color} />
                </View>
                <View className="flex-1 justify-center">
                    <Text className="font-bold text-[14px] text-rove-charcoal leading-tight">
                        {session.plan_title || translate('plan.workoutHistory.focusWorkout', { focus: session.focus })}
                    </Text>
                    <View className="flex-row items-center mt-1.5 flex-wrap gap-x-3 gap-y-1">
                        <View className="flex-row items-center">
                            <Feather name="calendar" size={10} color="#A8A29E" />
                            <Text className="text-[11px] text-rove-stone font-medium ml-1.5">{formatDate(session.date, translate)}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Feather name="clock" size={10} color="#A8A29E" />
                            <Text className="text-[11px] text-rove-stone font-medium ml-1.5">{formatDuration(session.duration_seconds)}</Text>
                        </View>
                    </View>
                    {/* Progress bar */}
                    <View className="flex-row items-center mt-3">
                        <View className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden mr-2.5 border border-stone-200/50">
                            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                        </View>
                        <Text className="text-[10px] font-bold text-rove-stone">{session.exercises_completed}/{session.exercises_total}</Text>
                    </View>
                </View>
                <View className="items-end justify-between ml-2">
                    <View className="px-2.5 py-1 rounded-full border border-white" style={{ backgroundColor: `${t.color}15` }}>
                        <Text className="text-[9px] font-bold uppercase tracking-wider text-rove-charcoal">{session.phase}</Text>
                    </View>
                    <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#A8A29E" />
                </View>
            </TouchableOpacity>

            {expanded && (
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="px-4 pb-4 pt-3 border-t border-stone-100/80 bg-[#FAFAF9]">
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {[
                            { icon: 'zap' as const, label: session.energy_level },
                            { icon: 'target' as const, label: session.focus },
                            { icon: 'bar-chart-2' as const, label: session.plan_intensity }
                        ].filter(b => b.label).map((b, i) => (
                            <View key={i} className={`bg-white rounded-lg px-2.5 py-1.5 flex-row items-center border border-stone-200/50 ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}>
                                <Feather name={b.icon} size={10} color="#A8A29E" />
                                <Text className="text-[11px] font-bold text-rove-charcoal ml-1.5">{b.label}</Text>
                            </View>
                        ))}
                    </View>

                    {session.warmup?.length > 0 && (
                        <View className="mb-2">
                            <Text className="text-[9px] uppercase font-bold tracking-widest mb-1.5 text-rove-charcoal">{translate('plan.workoutHistory.warmup')}</Text>
                            {session.warmup.map((item, i) => (
                                <View key={i} className="flex-row items-center py-1">
                                    <View className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ backgroundColor: t.color, opacity: 0.6 }} />
                                    <Text className="text-[12px] text-rove-charcoal leading-snug">{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {session.cooldown?.length > 0 && (
                        <View className="mt-2">
                            <Text className="text-[9px] uppercase font-bold tracking-widest mb-1.5 text-rove-charcoal">{translate('plan.workoutHistory.cooldown')}</Text>
                            {session.cooldown.map((item, i) => (
                                <View key={i} className="flex-row items-center py-1">
                                    <View className="w-1.5 h-1.5 rounded-full mr-2.5" style={{ backgroundColor: t.color, opacity: 0.5 }} />
                                    <Text className="text-[12px] text-rove-charcoal leading-snug">{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Animated.View>
            )}
        </Animated.View>
    );
}

export function WorkoutHistory({ phase, insightsLabel }: { phase: string; insightsLabel?: string }) {
    const { t, i18n } = useTranslation();
    const resolvedInsightsLabel = insightsLabel ?? t('plan.workoutHistory.completionByPhase');
    const theme = phaseThemes[phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [stats, setStats] = useState<PhaseStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"history" | "insights">("history");

    const grouped = sessions.reduce<Record<string, WorkoutSession[]>>((acc, s) => {
        const label = formatDate(s.date, t);
        if (!acc[label]) acc[label] = [];
        acc[label].push(s);
        return acc;
    }, {});

    const totalSessions = sessions.length;
    const totalMinutes = Math.round(sessions.reduce((a, s) => a + s.duration_seconds, 0) / 60);
    const avgCompletion = sessions.length
        ? Math.round(sessions.reduce((a, s) => a + completionPct(s), 0) / sessions.length)
        : 0;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            const { data: sessionData } = await supabase
                .from('workout_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(30);

            if (sessionData) setSessions(sessionData);

            const { data: statsData } = await supabase
                .rpc('get_phase_workout_stats', { p_user_id: user.id });

            if (statsData) setStats(statsData);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <View>
            {/* Sub-tabs */}
            <View className="flex-row bg-white/30 p-1 rounded-xl border border-white/40 mb-5">
                {(["history", "insights"] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setActiveTab(tab);
                        }}
                        className={`flex-1 py-2.5 rounded-lg items-center justify-center flex-row`}
                        style={activeTab === tab ? { backgroundColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                    >
                        <Feather name={tab === "history" ? "calendar" : "pie-chart"} size={11} color={activeTab === tab ? theme.color : '#A8A29E'} />
                        <Text className={`text-[10px] font-bold uppercase tracking-widest ml-1.5 ${activeTab === tab ? 'text-rove-charcoal' : 'text-rove-stone'}`}>
                            {tab === "history" ? t('plan.workoutHistory.historyTab') : t('plan.workoutHistory.insightsTab')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View className="py-10 items-center justify-center">
                    <ActivityIndicator color={theme.color} />
                </View>
            ) : activeTab === "history" ? (
                <View>
                    {/* Quick Stats */}
                    {sessions.length > 0 && (
                        <View className="flex-row gap-2 mb-5">
                            {[
                                { icon: 'award' as const, value: totalSessions, label: t('plan.workoutHistory.sessions') },
                                { icon: 'clock' as const, value: `${totalMinutes}`, label: t('plan.workoutHistory.minutes') },
                                { icon: 'check-circle' as const, value: `${avgCompletion}%`, label: t('plan.workoutHistory.avgDone') },
                            ].map((stat, i) => (
                                <View key={i} className="flex-1 rounded-[16px] p-3 items-center bg-white/40 border border-white/50"
                                    style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                                    <View className="w-7 h-7 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: `${theme.color}12` }}>
                                        <Feather name={stat.icon} size={12} color={theme.color} />
                                    </View>
                                    <Text className="text-base text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{stat.value}</Text>
                                    <Text className="text-[8px] text-rove-stone font-bold uppercase tracking-widest mt-0.5">{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {sessions.length === 0 ? (
                        <View className="py-12 items-center">
                            <View className="w-14 h-14 rounded-full bg-white/40 items-center justify-center mb-3">
                                <Feather name="wind" size={24} color="#D6D3D1" />
                            </View>
                            <Text className="text-sm text-rove-stone" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{t('plan.workoutHistory.noSessionsYet')}</Text>
                            <Text className="text-[11px] text-rove-stone mt-1">{t('plan.workoutHistory.generatePlanAbove')}</Text>
                        </View>
                    ) : (
                        <View>
                            {Object.entries(grouped).map(([label, daySessions]) => (
                                <View key={label} className="mb-3">
                                    <Text className="text-[9px] uppercase font-bold text-rove-stone tracking-widest mb-2 ml-1">{label as string}</Text>
                                    {daySessions.map(s => <SessionCard key={s.id} session={s} />)}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                <View>
                    {stats.length === 0 ? (
                        <View className="py-12 items-center">
                            <View className="w-14 h-14 rounded-full bg-white/40 items-center justify-center mb-3">
                                <Feather name="bar-chart-2" size={24} color="#D6D3D1" />
                            </View>
                            <Text className="text-sm text-rove-stone" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{t('plan.workoutHistory.notEnoughData')}</Text>
                            <Text className="text-[11px] text-rove-stone mt-1">{t('plan.workoutHistory.completeSessionsForInsights')}</Text>
                        </View>
                    ) : (
                        <View className="rounded-[18px] bg-white/40 border border-white/50 p-5"
                            style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
                            <Text className="text-[9px] font-bold uppercase tracking-widest mb-4 text-rove-charcoal">{resolvedInsightsLabel}</Text>
                            {stats.map(s => {
                                const t = phaseThemes[s.phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
                                const pct = Math.round((s.completion_rate || 0) * 100);
                                return (
                                    <View key={s.phase} className="flex-row items-center py-2.5 border-b border-white/30">
                                        <View className="w-2 h-2 rounded-full mr-2.5" style={{ backgroundColor: t.color }} />
                                        <Text className="text-[11px] font-bold text-rove-charcoal w-20">{s.phase}</Text>
                                        <View className="flex-1 h-2 bg-white/40 rounded-full mx-3 overflow-hidden border border-white/30">
                                            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                                        </View>
                                        <Text className="text-[10px] font-bold w-8 text-right text-rove-charcoal">{pct}%</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
