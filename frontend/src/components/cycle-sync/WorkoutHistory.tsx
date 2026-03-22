"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dumbbell, Clock, Flame, ChevronDown, ChevronUp,
    CheckCircle2, Circle, Calendar, TrendingUp, Zap,
    Activity, Trophy, BarChart2, Home, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client"; // 👈 adjust path

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface WorkoutHistoryProps {
    phase: string; // current phase for theming
    hideHeader?: boolean;
}

// ─── Theme map (matches ExerciseBuilder exactly) ──────────────────────────────
const themes: Record<string, any> = {
    Menstrual: {
        border: "border-phase-menstrual/20",
        iconBg: "bg-phase-menstrual/10",
        iconColor: "text-phase-menstrual",
        blob: "bg-phase-menstrual",
        pill: "bg-phase-menstrual/10 text-phase-menstrual border-phase-menstrual/20",
        bar: "bg-phase-menstrual",
    },
    Follicular: {
        border: "border-phase-follicular/20",
        iconBg: "bg-phase-follicular/10",
        iconColor: "text-phase-follicular",
        blob: "bg-phase-follicular",
        pill: "bg-phase-follicular/10 text-phase-follicular border-phase-follicular/20",
        bar: "bg-phase-follicular",
    },
    Ovulatory: {
        border: "border-phase-ovulatory/20",
        iconBg: "bg-phase-ovulatory/10",
        iconColor: "text-phase-ovulatory",
        blob: "bg-phase-ovulatory",
        pill: "bg-phase-ovulatory/10 text-phase-ovulatory border-phase-ovulatory/20",
        bar: "bg-phase-ovulatory",
    },
    Luteal: {
        border: "border-phase-luteal/20",
        iconBg: "bg-phase-luteal/10",
        iconColor: "text-phase-luteal",
        blob: "bg-phase-luteal",
        pill: "bg-phase-luteal/10 text-phase-luteal border-phase-luteal/20",
        bar: "bg-phase-luteal",
    },
};

// Phase dot colors for the phase badge
const phaseDot: Record<string, string> = {
    Menstrual: "bg-phase-menstrual",
    Follicular: "bg-phase-follicular",
    Ovulatory: "bg-phase-ovulatory",
    Luteal: "bg-phase-luteal",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: WorkoutSession }) {
    const [expanded, setExpanded] = useState(false);
    const t = themes[session.phase] || themes.Menstrual;
    const pct = completionPct(session);

    return (
        <motion.div
            layout
            className="bg-white/70 rounded-2xl border border-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
        >
            {/* Header row */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full p-4 flex items-start gap-3 text-left"
            >
                {/* Phase dot + icon */}
                <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", t.iconBg)}>
                    <Dumbbell className={cn("w-4 h-4", t.iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-800 leading-tight truncate">
                            {session.plan_title || `${session.focus} Workout`}
                        </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(session.date)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDuration(session.duration_seconds)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                            {session.setting === "Home"
                                ? <Home className="w-3 h-3" />
                                : <Building2 className="w-3 h-3" />}
                            {session.setting}
                        </span>
                    </div>

                    {/* Completion bar */}
                    <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", t.bar)}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 shrink-0">
                            {session.exercises_completed}/{session.exercises_total} done
                        </span>
                    </div>
                </div>

                {/* Right: phase pill + chevron */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", t.pill)}>
                        {session.phase}
                    </span>
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-gray-300" />
                        : <ChevronDown className="w-4 h-4 text-gray-300" />}
                </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                            {/* Stats chips */}
                            <div className="flex gap-2 flex-wrap">
                                <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{session.energy_level} Energy</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{session.focus}</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                                    <Flame className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{session.plan_intensity} Intensity</span>
                                </div>
                            </div>

                            {/* Warmup */}
                            {session.warmup?.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Warmup</p>
                                    <div className="space-y-1">
                                        {session.warmup.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 opacity-60", t.bar)} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cooldown */}
                            {session.cooldown?.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Cooldown</p>
                                    <div className="space-y-1">
                                        {session.cooldown.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 opacity-40", t.bar)} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Phase Stats Card ─────────────────────────────────────────────────────────
function PhaseStatsRow({ stat }: { stat: PhaseStats }) {
    const t = themes[stat.phase] || themes.Menstrual;
    const pct = Math.round((stat.completion_rate || 0) * 100);

    return (
        <div className="flex items-center gap-3 py-2.5">
            <div className={cn("w-2 h-2 rounded-full shrink-0", t.bar)} />
            <span className="text-sm font-bold text-gray-700 w-24 shrink-0">{stat.phase}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className={cn("h-full rounded-full", t.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            </div>
            <span className="text-xs font-bold text-gray-500 w-10 text-right shrink-0">{pct}%</span>
            <span className="text-[11px] text-gray-400 font-semibold w-16 text-right shrink-0">
                {stat.session_count} session{stat.session_count !== 1 ? 's' : ''}
            </span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function WorkoutHistory({ phase, hideHeader }: WorkoutHistoryProps) {
    const supabase = createClient();
    const theme = themes[phase] || themes.Menstrual;

    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [stats, setStats] = useState<PhaseStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"history" | "insights">("history");

    // Group sessions by relative date label
    const grouped = sessions.reduce<Record<string, WorkoutSession[]>>((acc, s) => {
        const label = formatDate(s.date);
        if (!acc[label]) acc[label] = [];
        acc[label].push(s);
        return acc;
    }, {});

    // Summary stats
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

            // Fetch recent sessions (last 30)
            const { data: sessionData } = await supabase
                .from('workout_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(30);

            if (sessionData) setSessions(sessionData);

            // Fetch phase stats via RPC
            const { data: statsData } = await supabase
                .rpc('get_phase_workout_stats', { p_user_id: user.id });

            if (statsData) setStats(statsData);

            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className={cn(
            "w-full bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative",
            theme.border
        )}>
            <div className={cn("absolute bottom-0 right-0 w-56 h-56 rounded-full blur-[80px] pointer-events-none opacity-20", theme.blob)} />

            <div className="p-5 md:p-6 relative z-10">
                {/* Header */}
                {!hideHeader && (
                    <header className="flex items-center gap-2 mb-5">
                        <div className={cn("p-1.5 rounded-lg border border-white/60", theme.iconBg, theme.iconColor)}>
                            <Dumbbell className="w-4 h-4" />
                        </div>
                        <h3 className="font-heading text-lg text-gray-800">Workout History</h3>
                    </header>
                )}

                {/* Tab switcher */}
                <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-inner mb-5">
                    {(["history", "insights"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize flex items-center justify-center gap-1.5",
                                activeTab === tab
                                    ? cn("text-white shadow-sm", theme.blob)
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab === "history" ? <Calendar className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
                            {tab}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="py-16 flex flex-col items-center justify-center gap-3">
                            <div className={cn("w-8 h-8 rounded-full border-2 border-t-transparent animate-spin", `border-current ${theme.iconColor}`)} />
                            <p className="text-xs font-bold text-gray-400 tracking-wide">Loading your sessions...</p>
                        </motion.div>

                    ) : activeTab === "history" ? (
                        <motion.div key="history" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                            {/* Summary strip */}
                            {sessions.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    {[
                                        { icon: Trophy, label: "Sessions", value: totalSessions },
                                        { icon: Clock, label: "Minutes", value: totalMinutes },
                                        { icon: CheckCircle2, label: "Avg Done", value: `${avgCompletion}%` },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="bg-white/70 rounded-xl border border-white p-3 flex flex-col items-center gap-0.5 shadow-sm">
                                            <Icon className={cn("w-4 h-4 mb-0.5", theme.iconColor)} />
                                            <span className="text-base font-bold text-gray-800">{value}</span>
                                            <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Session list */}
                            {sessions.length === 0 ? (
                                <div className="py-14 flex flex-col items-center justify-center text-center gap-3">
                                    <div className={cn("p-4 rounded-2xl", theme.iconBg)}>
                                        <Dumbbell className={cn("w-7 h-7", theme.iconColor)} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600">No sessions yet</p>
                                    <p className="text-xs text-gray-400 font-medium max-w-[200px]">
                                        Complete your first workout to see your history here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1 pb-2">
                                    {Object.entries(grouped).map(([label, daySessions]) => (
                                        <div key={label}>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 pl-1">{label}</p>
                                            <div className="space-y-2">
                                                {daySessions.map(s => (
                                                    <SessionCard key={s.id} session={s} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                    ) : (
                        /* ── INSIGHTS TAB ── */
                        <motion.div key="insights" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="space-y-4">

                            {stats.length === 0 ? (
                                <div className="py-14 flex flex-col items-center justify-center text-center gap-3">
                                    <div className={cn("p-4 rounded-2xl", theme.iconBg)}>
                                        <TrendingUp className={cn("w-7 h-7", theme.iconColor)} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600">Not enough data yet</p>
                                    <p className="text-xs text-gray-400 font-medium max-w-[200px]">
                                        Complete a few sessions to unlock phase insights
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Completion by phase */}
                                    <div className="bg-white/70 rounded-2xl border border-white p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <TrendingUp className={cn("w-4 h-4", theme.iconColor)} />
                                            <h4 className="text-sm font-bold text-gray-700">Completion by Phase</h4>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {stats.map(s => <PhaseStatsRow key={s.phase} stat={s} />)}
                                        </div>
                                    </div>

                                    {/* Best phase callout */}
                                    {stats.length > 0 && (() => {
                                        const best = [...stats].sort((a, b) => b.completion_rate - a.completion_rate)[0];
                                        const t2 = themes[best.phase] || themes.Menstrual;
                                        return (
                                            <div className={cn("rounded-2xl border p-4 relative overflow-hidden", t2.iconBg, t2.border)}>
                                                <div className={cn("absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-30", t2.blob)} />
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("p-2 rounded-xl", t2.blob)}>
                                                        <Trophy className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Power Phase</p>
                                                        <p className="text-base font-bold text-gray-800 mt-0.5">{best.phase}</p>
                                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                                            You complete <span className="font-bold text-gray-700">{Math.round(best.completion_rate * 100)}%</span> of exercises
                                                            — your most consistent phase
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Avg duration by phase */}
                                    <div className="bg-white/70 rounded-2xl border border-white p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className={cn("w-4 h-4", theme.iconColor)} />
                                            <h4 className="text-sm font-bold text-gray-700">Avg Duration by Phase</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {stats.map(s => {
                                                const t2 = themes[s.phase] || themes.Menstrual;
                                                return (
                                                    <div key={s.phase} className="flex items-center gap-3">
                                                        <div className={cn("w-2 h-2 rounded-full shrink-0", t2.bar)} />
                                                        <span className="text-xs font-bold text-gray-600 w-24 shrink-0">{s.phase}</span>
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {formatDuration(Math.round(s.avg_duration))}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}