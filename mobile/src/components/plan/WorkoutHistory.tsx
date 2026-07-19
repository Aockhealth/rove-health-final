import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { phaseThemes } from '../../data/home-content';

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

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function completionPct(session: WorkoutSession) {
    if (!session.exercises_total) return 0;
    return Math.round((session.exercises_completed / session.exercises_total) * 100);
}

function SessionCard({ session }: { session: WorkoutSession }) {
    const [expanded, setExpanded] = useState(false);
    const t = phaseThemes[session.phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    const pct = completionPct(session);

    return (
        <View className="rounded-[18px] overflow-hidden mb-3 bg-white/40 border border-white/50"
            style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} className="p-4 flex-row" activeOpacity={0.7}>
                <View className="w-10 h-10 rounded-[14px] items-center justify-center mr-3 border border-white/40"
                    style={{ backgroundColor: `${t.color}12` }}>
                    <Feather name="activity" size={16} color={t.color} />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-[13px] text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                        {session.plan_title || `${session.focus} Workout`}
                    </Text>
                    <View className="flex-row items-center mt-1.5 flex-wrap gap-x-3 gap-y-1">
                        <View className="flex-row items-center">
                            <Feather name="calendar" size={9} color="#A8A29E" />
                            <Text className="text-[10px] text-rove-stone font-medium ml-1">{formatDate(session.date)}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Feather name="clock" size={9} color="#A8A29E" />
                            <Text className="text-[10px] text-rove-stone font-medium ml-1">{formatDuration(session.duration_seconds)}</Text>
                        </View>
                    </View>
                    {/* Progress bar */}
                    <View className="flex-row items-center mt-2.5">
                        <View className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden mr-2 border border-white/30">
                            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                        </View>
                        <Text className="text-[9px] font-bold text-rove-stone">{session.exercises_completed}/{session.exercises_total}</Text>
                    </View>
                </View>
                <View className="items-end justify-between ml-2">
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${t.color}12` }}>
                        <Text className="text-[8px] font-bold" style={{ color: t.color }}>{session.phase}</Text>
                    </View>
                    <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color="#D6D3D1" />
                </View>
            </TouchableOpacity>

            {expanded && (
                <View className="px-4 pb-4 pt-2 border-t border-white/30">
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {[
                            { icon: 'zap' as const, label: session.energy_level },
                            { icon: 'target' as const, label: session.focus },
                            { icon: 'bar-chart-2' as const, label: session.plan_intensity }
                        ].filter(b => b.label).map((b, i) => (
                            <View key={i} className="bg-white/40 rounded-lg px-2.5 py-1.5 flex-row items-center border border-white/50">
                                <Feather name={b.icon} size={10} color="#A8A29E" />
                                <Text className="text-[10px] font-bold text-rove-charcoal ml-1">{b.label}</Text>
                            </View>
                        ))}
                    </View>

                    {session.warmup?.length > 0 && (
                        <View className="mb-2">
                            <Text className="text-[9px] uppercase font-bold tracking-widest mb-1.5" style={{ color: t.color }}>Warmup</Text>
                            {session.warmup.map((item, i) => (
                                <View key={i} className="flex-row items-center py-0.5">
                                    <View className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: t.color, opacity: 0.5 }} />
                                    <Text className="text-[11px] text-rove-charcoal">{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {session.cooldown?.length > 0 && (
                        <View className="mt-1">
                            <Text className="text-[9px] uppercase font-bold tracking-widest mb-1.5" style={{ color: t.color }}>Cooldown</Text>
                            {session.cooldown.map((item, i) => (
                                <View key={i} className="flex-row items-center py-0.5">
                                    <View className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: t.color, opacity: 0.4 }} />
                                    <Text className="text-[11px] text-rove-charcoal">{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

export function WorkoutHistory({ phase }: { phase: string }) {
    const theme = phaseThemes[phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [stats, setStats] = useState<PhaseStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"history" | "insights">("history");

    const grouped = sessions.reduce<Record<string, WorkoutSession[]>>((acc, s) => {
        const label = formatDate(s.date);
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
                        onPress={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 rounded-lg items-center justify-center flex-row`}
                        style={activeTab === tab ? { backgroundColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                    >
                        <Feather name={tab === "history" ? "calendar" : "pie-chart"} size={11} color={activeTab === tab ? theme.color : '#A8A29E'} />
                        <Text className={`text-[10px] font-bold uppercase tracking-widest ml-1.5 ${activeTab === tab ? 'text-rove-charcoal' : 'text-rove-stone'}`}>
                            {tab}
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
                                { icon: 'award' as const, value: totalSessions, label: 'Sessions' },
                                { icon: 'clock' as const, value: `${totalMinutes}`, label: 'Minutes' },
                                { icon: 'check-circle' as const, value: `${avgCompletion}%`, label: 'Avg Done' },
                            ].map((stat, i) => (
                                <View key={i} className="flex-1 rounded-[16px] p-3 items-center bg-white/40 border border-white/50"
                                    style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                                    <View className="w-7 h-7 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: `${theme.color}12` }}>
                                        <Feather name={stat.icon} size={12} color={theme.color} />
                                    </View>
                                    <Text className="text-base font-bold text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{stat.value}</Text>
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
                            <Text className="text-sm text-rove-stone" style={{ fontFamily: 'CormorantGaramond-Bold' }}>No sessions yet</Text>
                            <Text className="text-[11px] text-rove-stone/60 mt-1">Generate a plan above to get started</Text>
                        </View>
                    ) : (
                        <View>
                            {Object.entries(grouped).map(([label, daySessions]) => (
                                <View key={label} className="mb-3">
                                    <Text className="text-[9px] uppercase font-bold text-rove-stone tracking-widest mb-2 ml-1">{label}</Text>
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
                            <Text className="text-sm text-rove-stone" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Not enough data yet</Text>
                            <Text className="text-[11px] text-rove-stone/60 mt-1">Complete a few sessions to see insights</Text>
                        </View>
                    ) : (
                        <View className="rounded-[18px] bg-white/40 border border-white/50 p-5"
                            style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
                            <Text className="text-[9px] font-bold uppercase tracking-widest mb-4" style={{ color: theme.color }}>Completion by Phase</Text>
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
                                        <Text className="text-[10px] font-bold w-8 text-right" style={{ color: t.color }}>{pct}%</Text>
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
